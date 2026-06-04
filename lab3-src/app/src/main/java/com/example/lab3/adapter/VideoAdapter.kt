package com.example.lab3.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.lab3.R
import com.example.lab3.model.Video

class VideoAdapter(
    private val videos: MutableList<Video>,
    private val currentUserId: String,
    private val onClick: (Video) -> Unit
) : RecyclerView.Adapter<VideoAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tv_title)
        val owner: TextView = view.findViewById(R.id.tv_owner)
        val likes: TextView = view.findViewById(R.id.tv_likes)
        val shared: TextView = view.findViewById(R.id.tv_shared)

        init {
            view.setOnClickListener {
                val pos = bindingAdapterPosition
                if (pos != RecyclerView.NO_POSITION) onClick(videos[pos])
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_video, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val video = videos[position]
        holder.title.text = video.title
        holder.owner.text = "by ${video.ownerName}"
        holder.likes.text = "${video.likedBy.size} likes"
        holder.shared.visibility = if (currentUserId in video.sharedWith) View.VISIBLE else View.GONE
    }

    override fun getItemCount() = videos.size
}
