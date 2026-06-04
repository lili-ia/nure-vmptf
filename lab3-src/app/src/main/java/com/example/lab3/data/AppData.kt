package com.example.lab3.data

import com.example.lab3.model.Role
import com.example.lab3.model.User
import com.example.lab3.model.Video

object AppData {
    val users = mutableListOf(
        User("1", "admin", "admin", Role.ADMIN),
        User("2", "user1", "123", Role.USER),
        User("3", "user2", "123", Role.USER)
    )
    val videos = mutableListOf<Video>()
    var currentUser: User? = null
}
