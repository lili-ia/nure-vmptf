async function loadQuote() {
  const btn = document.getElementById('new-quote-btn');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const response = await fetch('quotes.json');
    const text = await response.text();
    const quotes = JSON.parse(text);
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById('quote-text').textContent = `"${quote.quote}"`;
    document.getElementById('quote-author').textContent = `— ${quote.author}`;
    document.getElementById('quote-category').textContent = quote.category;
  } catch (err) {
    document.getElementById('quote-text').textContent = 'Could not load a quote.';
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'New Quote';
  }
}

document.addEventListener('DOMContentLoaded', loadQuote);
