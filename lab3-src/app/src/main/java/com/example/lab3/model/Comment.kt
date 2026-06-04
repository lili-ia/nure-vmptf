package com.example.lab3.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class Comment(
    val id: String,
    val userId: String,
    val username: String,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun formattedTime(): String =
        SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault()).format(Date(timestamp))
}
