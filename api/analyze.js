export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product name required"
        });
    }

    try {

        // Simulated internet collection
        // Replaceable with real APIs later

        const reviews = [

            `${product} has strong performance and good quality.`,

            `Many users say ${product} gives good value for money.`,

            `${product} receives mixed opinions about battery and durability.`,

            `Some buyers recommend ${product} while others mention issues.`

        ];

        // Positive / negative word analysis

        const positiveWords = [
            "good",
            "great",
            "excellent",
            "strong",
            "recommend",
            "best",
            "love",
            "quality",
            "value"
        ];

        const negativeWords = [
            "bad",
            "poor",
            "issue",
            "problem",
            "mixed",
            "terrible",
            "worst",
            "damage"
        ];

        let score = 50;

        reviews.forEach(review => {

            const lower = review.toLowerCase();

            positiveWords.forEach(word => {
                if(lower.includes(word)){
                    score += 5;
                }
            });

            negativeWords.forEach(word => {
                if(lower.includes(word)){
                    score -= 5;
                }
            });

        });

        if(score > 100) score = 100;
        if(score < 0) score = 0;

        let summary = "";

        if(score >= 70){
            summary =
            `${product} shows mostly positive public sentiment. Users frequently appreciate overall performance and quality.`;
        }

        else if(score >= 40){
            summary =
            `${product} receives mixed opinions online. Buyers mention both strengths and weaknesses.`;
        }

        else{
            summary =
            `${product} shows largely negative sentiment with recurring criticism from users.`;
        }

        return res.status(200).json({

            product: product,
            score: score,
            summary: summary,
            reviews: reviews

        });

    }

    catch(error){

        return res.status(500).json({
            error: "Analysis failed"
        });

    }

}