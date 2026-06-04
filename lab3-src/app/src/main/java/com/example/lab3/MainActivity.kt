package com.example.lab3

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.EditText
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lab3.adapter.VideoAdapter
import com.example.lab3.data.AppData
import com.example.lab3.model.Video
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.util.UUID

class MainActivity : AppCompatActivity() {

    private lateinit var adapter: VideoAdapter

    private val pickVideo = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val uri = result.data?.data ?: return@registerForActivityResult
            showAddVideoDialog(uri)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val user = AppData.currentUser ?: run {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        title = "Відеотека — ${user.username}"

        val recycler = findViewById<RecyclerView>(R.id.rv_videos)
        adapter = VideoAdapter(AppData.videos, user.id) { video ->
            val intent = Intent(this, VideoDetailActivity::class.java)
            intent.putExtra("video_id", video.id)
            startActivity(intent)
        }
        recycler.layoutManager = LinearLayoutManager(this)
        recycler.adapter = adapter

        findViewById<FloatingActionButton>(R.id.fab_upload).setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "video/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            pickVideo.launch(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        adapter.notifyDataSetChanged()
    }

    private fun showAddVideoDialog(uri: Uri) {
        val input = EditText(this).apply {
            hint = "Назва відео"
            setPadding(48, 24, 48, 24)
        }
        AlertDialog.Builder(this)
            .setTitle("Додати відео")
            .setView(input)
            .setPositiveButton("Додати") { _, _ ->
                val title = input.text.toString().trim().ifEmpty { "Без назви" }
                val user = AppData.currentUser ?: return@setPositiveButton
                AppData.videos.add(
                    Video(UUID.randomUUID().toString(), title, uri.toString(), user.id, user.username)
                )
                adapter.notifyDataSetChanged()
                Toast.makeText(this, "Відео додано", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Скасувати", null)
            .show()
    }
}
