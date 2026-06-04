package com.example.lab3.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.lab3.R
import com.example.lab3.model.Comment

class CommentAdapter(
    private val comments: MutableList<Comment>,
    private val currentUserId: String,
    private val isAdmin: Boolean,
    private val onDelete: (Comment) -> Unit
) : RecyclerView.Adapter<CommentAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val username: TextView = view.findViewById(R.id.tv_username)
        val text: TextView = view.findViewById(R.id.tv_comment_text)
        val time: TextView = view.findViewById(R.id.tv_time)
        val delete: ImageButton = view.findViewById(R.id.btn_delete_comment)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_comment, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val comment = comments[position]
        holder.username.text = comment.username
        holder.text.text = comment.text
        holder.time.text = comment.formattedTime()
        val canDelete = isAdmin || comment.userId == currentUserId
        holder.delete.visibility = if (canDelete) View.VISIBLE else View.GONE
        holder.delete.setOnClickListener { onDelete(comment) }
    }

    override fun getItemCount() = comments.size
}
