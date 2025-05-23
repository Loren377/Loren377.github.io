document.getElementById('dogForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const size = document.getElementById('size').value;

    let foodAmount = 0;

    // Base recommendation (grams per kg of weight)
    if (age < 12) {
        // Puppies need more food
        if (size === 'small') foodAmount = weight * 60;
        else if (size === 'medium') foodAmount = weight * 70;
        else foodAmount = weight * 80;
    } else {
        // Adults
        if (size === 'small') foodAmount = weight * 30;
        else if (size === 'medium') foodAmount = weight * 40;
        else foodAmount = weight * 50;
    }

    document.getElementById('result').textContent =
        `Recommended food: ${foodAmount.toFixed(1)} grams per day.`;
});