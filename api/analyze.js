export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product required"
        });
    }

    try {

        // Web search (Wikipedia snippets)
        const wikiURL =
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(product + " review")}&format=json&origin=*`;

        const wikiRes = await fetch(wikiURL);
        const wikiData = await wikiRes.json();

        let snippets = [];

        if (
            wikiData.query &&
            wikiData.query.search
        ) {

            snippets =
                wikiData.query.search
                .slice(0,5)
                .map(item =>
                    item.snippet.replace(/<[^>]*>/g,'')
                );
        }

        if(snippets.length===0){

            snippets = [
                `${product} has limited review information online`
            ];
        }

        const combined =
            snippets.join(". ");

        // HuggingFace AI sentiment
        const hfResponse =
            await fetch(
                "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment",
                {
                    method:"POST",
                    headers:{
                        "Authorization":"Bearer YOUR_HF_TOKEN",
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        inputs:combined
                    })
                }
            );

        const hfData =
            await hfResponse.json();

        let score = 50;

        if(Array.isArray(hfData)){

            const sentiments =
                hfData[0];

            sentiments.forEach(s=>{

                if(
                    s.label.includes("POS")
                ){
                    score +=
                        Math.round(
                            s.score * 50
                        );
                }

                if(
                    s.label.includes("NEG")
                ){
                    score -=
                        Math.round(
                            s.score * 50
                        );
                }

            });

        }

        score =
            Math.max(
                0,
                Math.min(100,score)
            );

        let summary = "";

        if(score>=70){

            summary =
            `${product} shows mostly positive sentiment from collected online discussion.`;

        }

        else if(score>=40){

            summary =
            `${product} receives mixed sentiment online.`;

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
            error:error.message
        });

    }

}
