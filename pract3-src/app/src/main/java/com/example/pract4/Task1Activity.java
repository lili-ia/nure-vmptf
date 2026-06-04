package com.example.pract4;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class Task1Activity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_task1);

        EditText etNum1 = findViewById(R.id.etNumber1);
        EditText etNum2 = findViewById(R.id.etNumber2);
        Button btnCalc = findViewById(R.id.btnCalculate);
        TextView tvResult = findViewById(R.id.tvResult);

        btnCalc.setOnClickListener(v -> {
            String s1 = etNum1.getText().toString().trim();
            String s2 = etNum2.getText().toString().trim();

            if (s1.isEmpty() || s2.isEmpty()) {
                Toast.makeText(this, "Введіть обидва числа", Toast.LENGTH_SHORT).show();
                return;
            }

            try {
                double a = Double.parseDouble(s1);
                double b = Double.parseDouble(s2);
                double diff = a - b;
                String result = diff == (long) diff ? String.valueOf((long) diff) : String.valueOf(diff);
                tvResult.setText("Різниця: " + result);
            } catch (NumberFormatException e) {
                Toast.makeText(this, "Некоректне число", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
