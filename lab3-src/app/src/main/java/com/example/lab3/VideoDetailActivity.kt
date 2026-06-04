package com.example.lab3

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lab3.adapter.CommentAdapter
import com.example.lab3.data.AppData
import com.example.lab3.model.Comment
import com.example.lab3.model.Role
import java.util.UUID

class VideoDetailActivity : AppCompatActivity() {

    private lateinit var commentAdapter: CommentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_detail)

        val user = AppData.currentUser ?: return finish()
        val videoId = intent.getStringExtra("video_id") ?: return finish()
        val video = AppData.videos.find { it.id == videoId } ?: return finish()

        title = video.title

        val videoView = findViewById<VideoView>(R.id.video_view)
        val mediaController = MediaController(this)
        mediaController.setAnchorView(videoView)
        videoView.setMediaController(mediaController)
        videoView.setVideoURI(Uri.parse(video.uri))
        videoView.setOnPreparedListener { it.start() }
        videoView.setOnErrorListener { _, _, _ ->
            Toast.makeText(this, "Не вдалося відтворити відео", Toast.LENGTH_SHORT).show()
            true
        }
        videoView.requestFocus()

        val tvLikes = findViewById<TextView>(R.id.tv_likes)
        val btnLike = findViewById<Button>(R.id.btn_like)

        fun refreshLike() {
            val liked = user.id in video.likedBy
            btnLike.text = if (liked) "Прибрати лайк" else "Лайк"
            tvLikes.text = "${video.likedBy.size} лайків"
        }
        refreshLike()

        btnLike.setOnClickListener {
            if (user.id in video.likedBy) video.likedBy.remove(user.id)
            else video.likedBy.add(user.id)
            refreshLike()
        }

        val btnShare = findViewById<Button>(R.id.btn_share)
        btnShare.setOnClickListener { showShareDialog(video.id) }

        val btnDeleteVideo = findViewById<Button>(R.id.btn_delete_video)
        val canDelete = user.role == Role.ADMIN || video.ownerId == user.id
        btnDeleteVideo.visibility = if (canDelete) View.VISIBLE else View.GONE
        btnDeleteVideo.setOnClickListener {
            AppData.videos.remove(video)
            finish()
        }

        val rvComments = findViewById<RecyclerView>(R.id.rv_comments)
        commentAdapter = CommentAdapter(video.comments, user.id, user.role == Role.ADMIN) { comment ->
            video.comments.remove(comment)
            commentAdapter.notifyDataSetChanged()
        }
        rvComments.layoutManager = LinearLayoutManager(this)
        rvComments.adapter = commentAdapter

        val etComment = findViewById<EditText>(R.id.et_comment)
        findViewById<Button>(R.id.btn_send_comment).setOnClickListener {
            val text = etComment.text.toString().trim()
            if (text.isEmpty()) return@setOnClickListener
            video.comments.add(Comment(UUID.randomUUID().toString(), user.id, user.username, text))
            commentAdapter.notifyDataSetChanged()
            etComment.setText("")
            rvComments.scrollToPosition(video.comments.size - 1)
        }
    }

    private fun showShareDialog(videoId: String) {
        val video = AppData.videos.find { it.id == videoId } ?: return
        val currentUser = AppData.currentUser ?: return
        val otherUsers = AppData.users.filter { it.id != currentUser.id }
        if (otherUsers.isEmpty()) {
            Toast.makeText(this, "Немає інших користувачів", Toast.LENGTH_SHORT).show()
            return
        }
        val names = otherUsers.map { it.username }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("Поділитися з")
            .setItems(names) { _, index ->
                val recipient = otherUsers[index]
                video.sharedWith.add(recipient.id)
                Toast.makeText(this, "Відео надіслано ${recipient.username}", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Скасувати", null)
            .show()
    }
}
