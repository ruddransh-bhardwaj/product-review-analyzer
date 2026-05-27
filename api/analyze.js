export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product name required"
        });
    }

    try {

        // Simulate different internet opinions
        const opinionBank = [
            "excellent camera and performance",
            "battery life is poor",
            "good value for money",
            "premium build quality",
            "overpriced compared to competitors",
            "heating issues reported",
            "fast and reliable",
            "average experience overall",
            "highly recommended by users",
            "customer support complaints",
            "smooth performance",
            "durability concerns",
            "great design and display",
            "mixed online feedback"
        ];

        // Randomize reviews
        const shuffled =
            opinionBank.sort(() => 0.5 - Math.random());

        const selected =
            shuffled.slice(0, 5);

        const reviews =
            selected.map(r =>
                `${product}: ${r}`
            );

        const positiveWords = [
            "excellent",
            "good",
            "premium",
            "fast",
            "great",
            "recommended",
            "smooth",
            "reliable"
        ];

        const negativeWords = [
            "poor",
            "overpriced",
            "issues",
            "complaints",
            "concerns",
            "average",
            "mixed"
        ];

        let score = 50;

        reviews.forEach(review => {

            const lower = review.toLowerCase();

            positiveWords.forEach(word => {
                if(lower.includes(word))
                    score += 8;
            });

            negativeWords.forEach(word => {
                if(lower.includes(word))
                    score -= 8;
            });

        });

        score = Math.max(0, Math.min(100, score));

        let summary = "";

        if(score >= 70){
            summary =
            `${product} shows largely positive sentiment online with several favorable opinions.`;
        }
        else if(score >= 40){
            summary =
            `${product} receives mixed feedback with both praise and criticism.`;
        }
        else{
            summary =
            `${product} has mostly negative sentiment and repeated complaints.`;
        }

        return res.status(200).json({
            product,
            score,
            summary,
            reviews
        });

    }

    catch(error){

        return res.status(500).json({
            error: "Analysis failed"
        });

    }

}
