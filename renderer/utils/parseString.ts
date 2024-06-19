import axios from 'axios'


async function checkUsername(username: string) {

    try {
        const usernameFid = await axios.get('https://api.neynar.com/v2/farcaster/user/search', {
            params: {
                q: username,
                limit: 1
            },
            headers: {
                accept: 'application/json',
                api_key: 'NEYNAR_API_DOCS'
            }
        })
        if (usernameFid.data.result.users.length > 0) {
            if (usernameFid.data.result.users[0].username === username) {
                return usernameFid.data.result.users[0].fid
            } else {
                throw new Error("no username")
            }
        } else {
            throw new Error("no username")
        }
    } catch {
        return null
    }

}
export async function parseString(str) {
    let originalText = str;
    let mentions = [];
    let mentionsPositions = [];
    let embeds = [];
    let text = str.replace(/(@\w+(\.eth)?)|((http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)/g, function (match, mention, ethDomain, url, offset) {
        if (mention) {
            mentions.push(mention);

            return '';
        }
        if (url) {
            embeds.push(url);
            return url;
        }
    });
    let checkUser = [];
    for (let i = 0; i < mentions.length; i++) {
        const fid = await checkUsername(mentions[i].substring(1));
        if (fid !== null) {
            checkUser.push({ username: mentions[i], fid });
        }
    }
    let newText = str;
    for (let i = 0; i < checkUser.length; i++) {
        if (str.indexOf(checkUser[i].username) !== -1) {
            mentionsPositions.push(str.indexOf(checkUser[i].username));
            str = str.replace(checkUser[i].username, '');
            newText = str;
        }
    }

    return {
        originalText,
        text: newText,
        embeds: embeds.map(a => ({ url: a })),
        embedsDeprecated: [],
        mentions: checkUser.map(a => a.fid),
        mentionsUsername: checkUser.map(a => a.username),
        mentionsPositions: mentionsPositions
    };
}
