package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	db := connectDB()
	defer db.Close()

	createTb := `
	CREATE TABLE IF NOT EXISTS todos (
			id SERIAL PRIMARY KEY,
			title TEXT,
			status TEXT
	);
	`
	_, err := db.Exec(createTb)

	if err != nil {
		log.Fatal("can't create table", err)
	}

	fmt.Println("create table success")
}

func connectDB() *sql.DB {
	url := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", url)
	if err != nil {
		log.Fatal("Connect to database error", err)
	}

	return db
}
