package com.example.pract4;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button btnTask1 = findViewById(R.id.btnTask1);
        Button btnTask2 = findViewById(R.id.btnTask2);
        Button btnTask3 = findViewById(R.id.btnTask3);

        btnTask1.setOnClickListener(v -> startActivity(new Intent(this, Task1Activity.class)));
        btnTask2.setOnClickListener(v -> startActivity(new Intent(this, Task2Activity.class)));
        btnTask3.setOnClickListener(v -> startActivity(new Intent(this, Task3Activity.class)));
    }
}
