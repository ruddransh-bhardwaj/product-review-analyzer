export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product required"
        });
    }

    try {

        // Wikipedia Search API
        const url =
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(product)}&format=json`;

        const response = await fetch(url);

        const data = await response.json();

        let collected = [];

        if (
            data.query &&
            data.query.search
        ) {

            collected =
                data.query.search
                .slice(0,5)
                .map(item =>
                    item.snippet
                        .replace(/<[^>]*>/g,"")
                );
        }

        if(collected.length===0){

            collected = [
                `${product} has limited online information.`,
                `${product} receives mixed discussion online.`
            ];
        }

        const positiveWords = [
            "good",
            "best",
            "excellent",
            "popular",
            "quality",
            "fast",
            "success",
            "positive"
        ];

        const negativeWords = [
            "bad",
            "poor",
            "problem",
            "issue",
            "negative",
            "damage",
            "failure"
        ];

        let score = 50;

        collected.forEach(text=>{

            const lower =
                text.toLowerCase();

            positiveWords.forEach(word=>{
                if(lower.includes(word))
                    score += 5;
            });

            negativeWords.forEach(word=>{
                if(lower.includes(word))
                    score -= 5;
            });

        });

        score =
            Math.max(
                0,
                Math.min(100,score)
            );

        let summary="";

        if(score>=70){

            summary=
            `${product} shows positive online sentiment.`;

        }

        else if(score>=40){

            summary=
            `${product} receives mixed public discussion.`;

        }

        else{

            summary=
            `${product} shows mostly negative discussion online.`;

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
            error:error.message
        });

    }

}
