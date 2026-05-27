export default async function handler(req, res) {

    const product = req.query.product;

    if (!product) {
        return res.status(400).json({
            error: "Product required"
        });
    }

    try {

        // DuckDuckGo JSON API
        const url =
            `https://api.duckduckgo.com/?q=${encodeURIComponent(product + " reviews pros cons")}&format=json&no_html=1`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        let snippets = [];

        if(data.AbstractText){
            snippets.push(data.AbstractText);
        }

        if(data.RelatedTopics){

            data.RelatedTopics.forEach(item=>{

                if(item.Text){
                    snippets.push(item.Text);
                }

                if(item.Topics){

                    item.Topics.forEach(t=>{

                        if(t.Text){
                            snippets.push(t.Text);
                        }

                    });

                }

            });

        }

        snippets =
            snippets
            .filter(Boolean)
            .slice(0,8);

        if(snippets.length===0){

            snippets = [
                `${product} has limited online review information available.`,
                `${product} receives mixed public discussion online.`
            ];

        }

        const positiveWords = {

            excellent:10,
            great:8,
            good:6,
            best:10,
            smooth:7,
            premium:7,
            fast:6,
            quality:6,
            reliable:7,
            recommended:8,
            impressive:8,
            value:5

        };

        const negativeWords = {

            poor:10,
            bad:8,
            worst:10,
            issue:7,
            problem:7,
            complaint:8,
            damage:9,
            expensive:5,
            slow:7,
            heating:8,
            mixed:4,
            failure:9

        };

        let positiveScore = 0;
        let negativeScore = 0;

        snippets.forEach(text=>{

            const lower =
                text.toLowerCase();

            for(const word in positiveWords){

                if(lower.includes(word)){

                    positiveScore +=
                        positiveWords[word];
                }

            }

            for(const word in negativeWords){

                if(lower.includes(word)){

                    negativeScore +=
                        negativeWords[word];
                }

            }

        });

        let score = 50;

        score += positiveScore;
        score -= negativeScore;

        score =
            Math.max(
                0,
                Math.min(100,score)
            );

        let summary="";

        if(score>=75){

            summary =
            `${product} shows largely positive online sentiment with stronger favorable discussion.`;

        }

        else if(score>=45){

            summary =
            `${product} receives balanced or mixed public opinion online.`;

        }

        else{

            summary =
            `${product} shows mostly negative or critical online sentiment.`;

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
