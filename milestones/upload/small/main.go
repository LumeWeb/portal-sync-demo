package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/fatih/color"
	"github.com/gosuri/uiprogress"
	"lukechampine.com/blake3"
)

const (
	baseURL               = "https://s5.alpha.pinner.xyz"
	challengeTypeRegister = 1
	challengeTypeLogin    = 2
	emailDomain           = "@example.com"
)

func main() {
	// Initialize progress bars
	uiprogress.Start()

	// Generate a random username
	username, err := generateRandomUsername()
	if err != nil {
		log.Fatalf("Error generating random username: %v", err)
	}
	email := username + emailDomain

	// Generate a new Ed25519 key pair
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		log.Fatalf("Error generating key pair: %v", err)
	}

	// Register a new account
	registerBar := uiprogress.AddBar(100).AppendCompleted().PrependElapsed()
	registerBar.PrependFunc(func(b *uiprogress.Bar) string {
		return color.GreenString("Registering Account")
	})

	registerChallenge := getRegisterChallenge(pubKey)
	registerAccount(pubKey, privKey, registerChallenge, email, registerBar)

	// Login to the account
	loginBar := uiprogress.AddBar(100).AppendCompleted().PrependElapsed()
	loginBar.PrependFunc(func(b *uiprogress.Bar) string {
		return color.BlueString("Logging In        ")
	})

	loginChallenge := getLoginChallenge(pubKey)
	jwt := loginAccount(pubKey, privKey, loginChallenge, loginBar)

	// Generate 40 MB of random data
	dataBar := uiprogress.AddBar(100).AppendCompleted().PrependElapsed()
	dataBar.PrependFunc(func(b *uiprogress.Bar) string {
		return color.YellowString("Generating Data   ")
	})

	data := make([]byte, 1024*1024*40)
	for i := 0; i < 100; i++ {
		_, err = rand.Read(data[i*len(data)/100 : (i+1)*len(data)/100])
		if err != nil {
			log.Fatalf("Error generating random data: %v", err)
		}
		dataBar.Incr()
		time.Sleep(10 * time.Millisecond) // Simulate some work
	}

	hashBytes := blake3.Sum256(data)

	// Upload the random data
	uploadBar := uiprogress.AddBar(100).AppendCompleted().PrependElapsed()
	uploadBar.PrependFunc(func(b *uiprogress.Bar) string {
		return color.MagentaString("Uploading File    ")
	})

	uploadFile(jwt, data, uploadBar)

	// Ensure all progress bars are at 100% before stopping
	registerBar.Set(100)
	loginBar.Set(100)
	dataBar.Set(100)
	uploadBar.Set(100)

	// Wait a moment for the progress bars to update
	time.Sleep(100 * time.Millisecond)

	// Stop the progress bars
	uiprogress.Stop()

	fmt.Println(color.GreenString("\nData uploaded successfully, hash: %s", hex.EncodeToString(hashBytes[:])))
}

func generateRandomUsername() (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i, v := range b {
		b[i] = letters[v%byte(len(letters))]
	}
	return string(b), nil
}

func getRegisterChallenge(pubKey ed25519.PublicKey) string {
	pubKeyWithPrefix := append([]byte{0xed}, pubKey...)
	url := baseURL + "/s5/account/register?pubKey=" + base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix)
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalf("Error getting register challenge: %v", err)
	}
	defer resp.Body.Close()

	var challengeResp struct {
		Challenge string `json:"challenge"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&challengeResp); err != nil {
		log.Fatalf("Error decoding register challenge response: %v", err)
	}

	return challengeResp.Challenge
}

func registerAccount(pubKey ed25519.PublicKey, privKey ed25519.PrivateKey, challenge, email string, bar *uiprogress.Bar) {
	decodedChallenge, err := base64.RawURLEncoding.DecodeString(challenge)
	if err != nil {
		log.Fatalf("Error decoding register challenge: %v", err)
	}

	response := signChallenge(privKey, decodedChallenge, challengeTypeRegister, baseURL)

	pubKeyWithPrefix := append([]byte{0xed}, pubKey...)
	reqBody := map[string]string{
		"pubKey":    base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix),
		"response":  base64.RawURLEncoding.EncodeToString(response.response),
		"signature": base64.RawURLEncoding.EncodeToString(response.signature),
		"email":     email,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshaling registration request body: %v", err)
	}

	resp, err := http.Post(baseURL+"/s5/account/register", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatalf("Error registering account: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Registration failed with status code: %d", resp.StatusCode)
	}

	bar.Set(100) // Complete the progress bar
}

func getLoginChallenge(pubKey ed25519.PublicKey) string {
	pubKeyWithPrefix := append([]byte{0xed}, pubKey...)
	url := baseURL + "/s5/account/login?pubKey=" + base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix)
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalf("Error getting login challenge: %v", err)
	}
	defer resp.Body.Close()

	var challengeResp struct {
		Challenge string `json:"challenge"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&challengeResp); err != nil {
		log.Fatalf("Error decoding login challenge response: %v", err)
	}

	return challengeResp.Challenge
}

func loginAccount(pubKey ed25519.PublicKey, privKey ed25519.PrivateKey, challenge string, bar *uiprogress.Bar) string {
	decodedChallenge, err := base64.RawURLEncoding.DecodeString(challenge)
	if err != nil {
		log.Fatalf("Error decoding login challenge: %v", err)
	}

	response := signChallenge(privKey, decodedChallenge, challengeTypeLogin, baseURL)

	pubKeyWithPrefix := append([]byte{0xed}, pubKey...)
	reqBody := map[string]string{
		"pubKey":    base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix),
		"response":  base64.RawURLEncoding.EncodeToString(response.response),
		"signature": base64.RawURLEncoding.EncodeToString(response.signature),
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshaling login request body: %v", err)
	}

	resp, err := http.Post(baseURL+"/s5/account/login", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatalf("Error logging in: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Login failed with status code: %d", resp.StatusCode)
	}

	// Extract the JWT from the response cookies
	var jwt string
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "auth_token" {
			jwt = cookie.Value
			break
		}
	}

	bar.Set(100) // Complete the progress bar
	return jwt
}

func uploadFile(jwt string, data []byte, bar *uiprogress.Bar) {
	url := baseURL + "/s5/upload"

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", "random_data")
	if err != nil {
		log.Fatalf("Error creating form file: %v", err)
	}

	dataReader := bytes.NewReader(data)
	_, err = io.Copy(part, &ProgressReader{reader: dataReader, bar: bar, totalSize: int64(len(data))})
	if err != nil {
		log.Fatalf("Error copying data: %v", err)
	}

	err = writer.Close()
	if err != nil {
		log.Fatalf("Error closing multipart writer: %v", err)
	}

	req, err := http.NewRequest("POST", url, &ProgressReader{reader: body, bar: bar, totalSize: int64(body.Len())})
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+jwt)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Data upload failed with status code: %d", resp.StatusCode)
	}

	// Ensure the progress bar reaches 100%
	bar.Set(100)
}

type ChallengeResponse struct {
	response  []byte
	signature []byte
}

func signChallenge(privKey ed25519.PrivateKey, challenge []byte, challengeType int, serviceAuthority string) ChallengeResponse {
	serviceBytes := blake3.Sum256([]byte(serviceAuthority))

	message := append([]byte{byte(challengeType)}, challenge...)
	message = append(message, serviceBytes[:]...)
	signature := ed25519.Sign(privKey, message)

	return ChallengeResponse{message, signature}
}

type ProgressReader struct {
	reader    io.Reader
	bar       *uiprogress.Bar
	totalSize int64
	read      int64
}

func (pr *ProgressReader) Read(p []byte) (int, error) {
	n, err := pr.reader.Read(p)
	pr.read += int64(n)
	progress := int(float64(pr.read) / float64(pr.totalSize) * 100)
	pr.bar.Set(progress)
	return n, err
}
