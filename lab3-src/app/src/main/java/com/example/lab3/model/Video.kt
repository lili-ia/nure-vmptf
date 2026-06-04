package com.example.lab3.model

data class Video(
    val id: String,
    val title: String,
    val uri: String,
    val ownerId: String,
    val ownerName: String,
    val likedBy: MutableSet<String> = mutableSetOf(),
    val comments: MutableList<Comment> = mutableListOf(),
    val sharedWith: MutableSet<String> = mutableSetOf()
)
