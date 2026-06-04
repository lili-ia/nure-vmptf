package com.example.pract4;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class Task3Activity extends AppCompatActivity {

    private EditText etNum1, etNum2;
    private TextView tvResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_task3);

        etNum1 = findViewById(R.id.etNum1);
        etNum2 = findViewById(R.id.etNum2);
        tvResult = findViewById(R.id.tvResult);

        findViewById(R.id.btnAdd).setOnClickListener(v -> compute("+"));
        findViewById(R.id.btnSub).setOnClickListener(v -> compute("-"));
        findViewById(R.id.btnMul).setOnClickListener(v -> compute("×"));
        findViewById(R.id.btnDiv).setOnClickListener(v -> compute("÷"));
        findViewById(R.id.btnPow).setOnClickListener(v -> compute("^"));
        findViewById(R.id.btnMod).setOnClickListener(v -> compute("%"));
        findViewById(R.id.btnHistory).setOnClickListener(v -> showHistory());
    }

    private void compute(String op) {
        String s1 = etNum1.getText().toString().trim();
        String s2 = etNum2.getText().toString().trim();

        if (s1.isEmpty() || s2.isEmpty()) {
            Toast.makeText(this, "Введіть обидва числа", Toast.LENGTH_SHORT).show();
            return;
        }

        double a, b;
        try {
            a = Double.parseDouble(s1);
            b = Double.parseDouble(s2);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Некоректне число", Toast.LENGTH_SHORT).show();
            return;
        }

        double result;
        switch (op) {
            case "+": result = a + b; break;
            case "-": result = a - b; break;
            case "×": result = a * b; break;
            case "÷":
                if (b == 0) { Toast.makeText(this, "Ділення на нуль", Toast.LENGTH_SHORT).show(); return; }
                result = a / b;
                break;
            case "^": result = Math.pow(a, b); break;
            default:
                if (b == 0) { Toast.makeText(this, "Ділення на нуль", Toast.LENGTH_SHORT).show(); return; }
                result = a % b;
        }

        String line = s1 + " " + op + " " + s2 + " = " + fmt(result);
        tvResult.setText(line);
        saveHistory(line);
    }

    private String fmt(double v) {
        return v == (long) v ? String.valueOf((long) v) : String.valueOf(v);
    }

    private void saveHistory(String line) {
        try (FileWriter fw = new FileWriter(new File(getFilesDir(), "history.txt"), true)) {
            fw.write(line + "\n");
        } catch (IOException ignored) {}
    }

    private void showHistory() {
        File f = new File(getFilesDir(), "history.txt");
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append("\n");
        } catch (IOException ignored) {}

        String text = sb.toString().trim();
        new AlertDialog.Builder(this)
            .setTitle("Історія")
            .setMessage(text.isEmpty() ? "Порожньо" : text)
            .setPositiveButton("OK", null)
            .setNeutralButton("Очистити", (d, w) -> f.delete())
            .show();
    }
}
