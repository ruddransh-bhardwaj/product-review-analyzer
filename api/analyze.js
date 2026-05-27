export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product required"
        });
    }

    try {

        // Stable Wikipedia search
        const url =
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(product + " review")}&format=json&origin=*`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = await response.json();

        let snippets = [];

        if (
            data.query &&
            data.query.search
        ) {

            snippets =
                data.query.search
                .slice(0, 6)
                .map(item =>
                    item.snippet
                        .replace(/<[^>]*>/g, "")
                );
        }

        // Safe fallback
        if (snippets.length === 0) {

            snippets = [
                `${product} has limited online discussion.`,
                `${product} has mixed available information.`
            ];
        }

        // Better weighted sentiment
        const positive = {
            good: 5,
            excellent: 9,
            great: 8,
            best: 10,
            fast: 5,
            premium: 6,
            reliable: 7,
            smooth: 5,
            quality: 6,
            recommended: 7,
            success: 6,
            popular: 4
        };

        const negative = {
            bad: 7,
            poor: 8,
            issue: 7,
            problem: 7,
            complaint: 8,
            expensive: 4,
            damage: 9,
            slow: 6,
            failure: 9,
            worst: 10,
            heating: 8
        };

        let pos = 0;
        let neg = 0;

        snippets.forEach(text => {

            const lower =
                text.toLowerCase();

            for (let word in positive) {
                if (lower.includes(word)) {
                    pos += positive[word];
                }
            }

            for (let word in negative) {
                if (lower.includes(word)) {
                    neg += negative[word];
                }
            }

        });

        let score =
            50 + pos - neg;

        score =
            Math.max(
                0,
                Math.min(100, score)
            );

        let summary = "";

        if(score >= 75){

            summary =
            `${product} shows mostly positive online sentiment.`;

        }

        else if(score >= 45){

            summary =
            `${product} receives mixed online discussion.`;

        }

        else{

            summary =
            `${product} shows mostly negative sentiment online.`;

        }

        return res.status(200).json({

            product,
            score,
            summary,
            reviews: snippets

        });

    }

    catch(error){

        return res.status(500).json({
            error: error.message
        });

    }

}
