package com.example.lab3.model

enum class Role { ADMIN, USER }

data class User(
    val id: String,
    val username: String,
    val password: String,
    val role: Role = Role.USER
)
