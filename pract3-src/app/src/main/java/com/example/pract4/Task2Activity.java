package com.example.pract4;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Random;

public class Task2Activity extends AppCompatActivity {

    private int secret;
    private int attempts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_task2);

        EditText etGuess = findViewById(R.id.etGuess);
        Button btnGuess = findViewById(R.id.btnGuess);
        Button btnNew = findViewById(R.id.btnNewGame);
        TextView tvMsg = findViewById(R.id.tvMessage);
        TextView tvAttempts = findViewById(R.id.tvAttempts);

        newGame();

        btnGuess.setOnClickListener(v -> {
            String input = etGuess.getText().toString().trim();
            if (input.isEmpty()) return;

            int guess;
            try {
                guess = Integer.parseInt(input);
            } catch (NumberFormatException e) {
                Toast.makeText(this, "Введіть ціле число", Toast.LENGTH_SHORT).show();
                return;
            }

            if (guess < 1 || guess > 100) {
                tvMsg.setText("Число від 1 до 100");
                return;
            }

            attempts++;
            etGuess.setText("");
            tvAttempts.setText("Спроб: " + attempts);

            if (guess < secret) {
                tvMsg.setText("Більше");
            } else if (guess > secret) {
                tvMsg.setText("Менше");
            } else {
                tvMsg.setText("Вгадали за " + attempts + " спроб!");
                btnGuess.setEnabled(false);
                btnNew.setVisibility(View.VISIBLE);
            }
        });

        btnNew.setOnClickListener(v -> {
            newGame();
            tvMsg.setText("");
            tvAttempts.setText("");
            etGuess.setText("");
            btnGuess.setEnabled(true);
            btnNew.setVisibility(View.GONE);
        });
    }

    private void newGame() {
        secret = new Random().nextInt(100) + 1;
        attempts = 0;
    }
}
