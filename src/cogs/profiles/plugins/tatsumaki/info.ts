import { IProfilesPlugin, AddedProfilePluginType } from "../plugin";
import { GuildMember } from "discord.js";
import { IEmbedOptionsField, escapeDiscordMarkdown, getLogger } from "../../../utils/utils";
import { getTatsuProfile, IUserInfo } from "./tatsumaki";
import { localizeForUser } from "../../../utils/ez-i18n";

const LOG = getLogger("TatsuPlugin");

export interface ITatsumakiInfo {
	uid: string;
}

export interface ITatsumakiPluginConfig {
	apiKey: string;
	iconEmojiId: string;
}

export class TatsumakiProfilePlugin implements IProfilesPlugin {
	public get signature() {
		return "snowball.features.profile.plugins.tatsumaki";
	}

	private config: ITatsumakiPluginConfig;

	constructor(config: ITatsumakiPluginConfig) {
		if(!config) {
			throw new Error("No config passed");
		}
		const emoji = $discordBot.emojis.get(config.iconEmojiId);
		if(!emoji) { throw new Error(`Emoji with icon by ID "${config.iconEmojiId}" not found`); }
		config.iconEmojiId = emoji.toString();
		this.config = config;
	}

	async getSetupArgs() {
		return null;
	}

	async setup(_str: string, member: GuildMember) {
		const js: ITatsumakiInfo = {
			uid: member.id
		};

		try {
			await getTatsuProfile(js.uid, this.config.apiKey);
		} catch(err) {
			LOG("err", `${js.uid}: Can't get Tatsumaki profile`, err, "(setup)");
			throw new Error("Failed to get Tatsumaki profile!");
		}

		return {
			json: JSON.stringify(js),
			type: AddedProfilePluginType.Embed
		};
	}

	async getEmbed(info: ITatsumakiInfo | string, caller: GuildMember): Promise<IEmbedOptionsField> {
		if(typeof info !== "object") {
			info = JSON.parse(info) as ITatsumakiInfo;
		}

		const logPrefix = `${info.uid}:`;
		let profile: IUserInfo | undefined = undefined;

		try {
			profile = await getTatsuProfile(info.uid, this.config.apiKey);
		} catch(err) {
			LOG("err", logPrefix, "Error", err);
			throw new Error("Failed to get Tatsumaki profile.");
		}

		if(!profile) {
			LOG("err", logPrefix, "No 'profile' variable!");
			throw new Error("Internal Error");
		}

		LOG("ok", logPrefix, "Generating embed");

		let str = "";
		str += `**${escapeDiscordMarkdown(profile.name)}**\n`;
		str += (await localizeForUser(caller, "TATSUMAKIPROFILEPLUGIN_REP", {
			rep: profile.reputation
		})) + "\n";
		str += await localizeForUser(caller, "TATSUMAKIPROFILEPLUGIN_LVL", {
			lvl: profile.level
		});
		str += ` (${profile.xp[0]}XP / ${profile.xp[1]}XP)\n`;
		str += (await localizeForUser(caller, "TATSUMAKIPROFILEPLUGIN_CREDITS", {
			credits: profile.credits
		})) + "\n";
		str += await localizeForUser(caller, "TATSUMAKIPROFILEPLUGIN_RANK", {
			rank: profile.rank
		});

		try {
			return {
				inline: true,
				name: `${this.config.iconEmojiId} Tatsumaki`,
				value: str
			};
		} catch(err) {
			LOG("err", logPrefix, "Failed to generate embed", err);
			throw new Error("Failed to generate embed");
		}
	}

	async unload() { return true; }
}

module.exports = TatsumakiProfilePlugin;