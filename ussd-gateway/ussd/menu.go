package ussd

import (
	"strings"
)

// Language strings map
type LocalizedText map[string]string

func (lt LocalizedText) Get(lang string) string {
	if val, ok := lt[lang]; ok {
		return val
	}
	return lt["en"]
}

// Menu Screen Definition
type Screen struct {
	Header  LocalizedText
	Options []Option
	IsEnd   bool
}

type Option struct {
	Key      string
	Label    LocalizedText
	NextPath string
}

// EnforceMaxChars ensures the generated USSD response stays within telecom 160 char constraints.
func EnforceMaxChars(text string, maxChars int) string {
	if len(text) <= maxChars {
		return text
	}
	// Truncate cleanly
	return text[:maxChars-3] + "..."
}

// Crop farmgate price index mock data
var FarmgatePrices = map[string]map[string]float64{
	"Cocoa": {
		"Bo":        85.0,
		"Kenema":    90.0,
		"Kailahun":  92.5,
		"Port Loko": 80.0,
	},
	"Rice": {
		"Bo":        45.0,
		"Kambia":    48.0,
		"Port Loko": 46.5,
		"Tonkolili": 44.0,
	},
	"Cassava": {
		"Bo":        25.0,
		"Kambia":    26.0,
		"Port Loko": 24.5,
		"Tonkolili": 23.0,
	},
	"Oil Palm": {
		"Bo":        65.0,
		"Kenema":    70.0,
		"Kailahun":  68.0,
	},
}

// FormatScreen renders the text response for a screen, including 0:Back and 00:Home navigation.
func FormatScreen(header string, options []string, isCON bool) string {
	var b strings.Builder
	b.WriteString(header)
	if len(options) > 0 {
		b.WriteString("\n")
		b.WriteString(strings.Join(options, "\n"))
	}
	res := b.String()
	prefix := "CON "
	if !isCON {
		prefix = "END "
	}
	// Enforce 160 char limit for the body
	trimmed := EnforceMaxChars(res, 155)
	return prefix + trimmed
}
