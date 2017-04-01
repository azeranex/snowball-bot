export function stringifyError(err, filter = null, space = 2) {
    let plainObject = {};
    Object.getOwnPropertyNames(err).forEach(function(key) {
        plainObject[key] = err[key];
    });
    return JSON.stringify(plainObject, filter, space);
}

export function escapeRegExp(str:string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function replaceAll(str:string, search:string, replacement:string) {
    search = escapeRegExp(search);
    return str.replace(new RegExp(search, 'g'), replacement);
};

export function circularFilter(item) {
  let i = 0;

  return function(key, value) {
    if(i !== 0 && typeof(item) === 'object' && typeof(value) === 'object' && item === value){
        return '[Circular]'; 
    }

    if(i >= 10) {
        return '(...)';
    }

    ++i; // so we know we aren't using the original object anymore

    return value;  
  };
}

export function objectToMap<T>(obj) {
    let map = new Map<string, T>();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}

export function commandRedirect(content:string, redirects:Map<string, Function>) {
    redirects.forEach((val, key) => {
        let keySpaced = `${key} `;
        let itsStarts = content.startsWith(keySpaced);
        if(itsStarts || content === key) {
            val(itsStarts ? content.slice(keySpaced.length) : content);
        }
    });
}

export function escapeDiscordMarkdown(str:string) {
    str = replaceAll(str, "`", "'");
    str = replaceAll(str, "*", "\\*");
    str = replaceAll(str, " _", " \\_");
    str = replaceAll(str, "_ ", "\\_ ");
    return str;
}

export enum EmbedType {
    Error,
    OK,
    Custom
}
// customFooter?:string

export interface IEmbedOptions {
    customFooter?:string;
    customColor?:string;
}

export function generateEmbed(type:EmbedType, description:string, imageUrl?:string, options?:IEmbedOptions) {
    return {
        description: description,
        image: imageUrl ? {
            url: imageUrl
        } : undefined,
        color: type === EmbedType.Error ? 0xe53935 : type === EmbedType.OK ? 0x43A047 : options ? options.customColor : undefined,
        author: type === EmbedType.Error ? {
            name: "Ошибка",
            icon_url: "https://i.imgur.com/9IwsjHS.png"
        } : type === EmbedType.OK ? {
            name: "Успех!",
            icon_url: "https://i.imgur.com/FcnCpHL.png"
        } : undefined,
        footer: options && options.customFooter ? {
            text: options.customFooter
        } : {
            text: discordBot.user.username
        }
    };
}