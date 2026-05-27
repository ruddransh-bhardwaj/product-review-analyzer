export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product required"
        });
    }

    try {

        // DuckDuckGo Instant Answer API
        const url =
            `https://api.duckduckgo.com/?q=${encodeURIComponent(product + " reviews opinions")}&format=json&no_html=1`;

        const response = await fetch(url);
        const data = await response.json();

        let collected = [];

        // Collect related text
        if (data.AbstractText) {
            collected.push(data.AbstractText);
        }

        if (data.RelatedTopics) {

            data.RelatedTopics.forEach(item => {

                if (item.Text) {
                    collected.push(item.Text);
                }

                if (item.Topics) {
                    item.Topics.forEach(t => {
                        if (t.Text) {
                            collected.push(t.Text);
                        }
                    });
                }

            });

        }

        // Fallback
        if (collected.length === 0) {

            collected = [
                `${product} has limited public review information online.`,
                `${product} shows mixed public discussion.`
            ];

        }

        collected = collected.slice(0,5);

        const positiveWords = [
            "good",
            "great",
            "excellent",
            "best",
            "love",
            "fast",
            "quality",
            "positive",
            "recommended",
            "smooth",
            "impressive"
        ];

        const negativeWords = [
            "bad",
            "poor",
            "worst",
            "issue",
            "problem",
            "negative",
            "complaint",
            "slow",
            "damage",
            "expensive"
        ];

        let score = 50;

        collected.forEach(text => {

            const lower = text.toLowerCase();

            positiveWords.forEach(word => {
                if(lower.includes(word))
                    score += 6;
            });

            negativeWords.forEach(word => {
                if(lower.includes(word))
                    score -= 6;
            });

        });

        score =
            Math.max(
                0,
                Math.min(100, score)
            );

        let summary = "";

        if(score >= 70){

            summary =
            `${product} shows mostly positive online discussion and favorable public opinion.`;

        }

        else if(score >= 40){

            summary =
            `${product} receives mixed online feedback with both positive and negative discussion.`;

        }

        else{

            summary =
            `${product} shows mostly negative sentiment based on available online discussion.`;

        }

        return res.status(200).json({

            product,
            score,
            summary,
            reviews: collected

        });

    }

    catch(error){

        return res.status(500).json({
            error: "Analysis failed"
        });

    }

}
