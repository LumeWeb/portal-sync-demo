package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/fatih/color"
	"github.com/gosuri/uiprogress"
	"lukechampine.com/blake3"
)

const (
	s5BaseURL             = "https://s5.delta.pinner.xyz"
	syncBaseURL           = "https://sync.delta.pinner.xyz"
	challengeTypeRegister = 1
	challengeTypeLogin    = 2
	emailDomain           = "@example.com"
)

func main() {
	// Parse command-line arguments
	fileHash := flag.String("hash", "", "Hash of the file to import")
	flag.Parse()

	if *fileHash == "" {
		log.Fatal("The -hash argument is required")
	}

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

	// Import the file
	importBar := uiprogress.AddBar(100).AppendCompleted().PrependElapsed()
	importBar.PrependFunc(func(b *uiprogress.Bar) string {
		return color.MagentaString("Importing File    ")
	})

	importFile(jwt, *fileHash, importBar)

	// Ensure all progress bars are at 100% before stopping
	registerBar.Set(100)
	loginBar.Set(100)
	importBar.Set(100)

	// Wait a moment for the progress bars to update
	time.Sleep(100 * time.Millisecond)

	// Stop the progress bars
	uiprogress.Stop()

	fmt.Println(color.GreenString("\nFile imported successfully, hash: %s", *fileHash))
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
	url := s5BaseURL + "/s5/account/register?pubKey=" + base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix)
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

	response := signChallenge(privKey, decodedChallenge, challengeTypeRegister, s5BaseURL)

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

	resp, err := http.Post(s5BaseURL+"/s5/account/register", "application/json", bytes.NewBuffer(jsonBody))
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
	url := s5BaseURL + "/s5/account/login?pubKey=" + base64.RawURLEncoding.EncodeToString(pubKeyWithPrefix)
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

	response := signChallenge(privKey, decodedChallenge, challengeTypeLogin, s5BaseURL)

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

	resp, err := http.Post(s5BaseURL+"/s5/account/login", "application/json", bytes.NewBuffer(jsonBody))
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

func importFile(jwt, fileHash string, bar *uiprogress.Bar) {
	url := syncBaseURL + "/api/import"

	reqBody := map[string]string{
		"object": fileHash,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshaling import request body: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+jwt)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error sending request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("File import failed with status code: %d", resp.StatusCode)
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
