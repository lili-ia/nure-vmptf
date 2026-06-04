package com.example.lab3

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.lab3.data.AppData
import com.example.lab3.model.Role
import com.example.lab3.model.User
import java.util.UUID

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val etUsername = findViewById<EditText>(R.id.et_username)
        val etPassword = findViewById<EditText>(R.id.et_password)

        findViewById<Button>(R.id.btn_login).setOnClickListener {
            val username = etUsername.text.toString().trim()
            val password = etPassword.text.toString()
            val user = AppData.users.find { it.username == username && it.password == password }
            if (user != null) {
                AppData.currentUser = user
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Невірний логін або пароль", Toast.LENGTH_SHORT).show()
            }
        }

        findViewById<Button>(R.id.btn_register).setOnClickListener {
            val username = etUsername.text.toString().trim()
            val password = etPassword.text.toString()
            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Заповніть усі поля", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (AppData.users.any { it.username == username }) {
                Toast.makeText(this, "Ім'я вже зайняте", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val user = User(UUID.randomUUID().toString(), username, password, Role.USER)
            AppData.users.add(user)
            AppData.currentUser = user
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }
}
