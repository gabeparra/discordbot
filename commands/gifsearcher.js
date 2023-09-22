const { SlashCommandBuilder } = require("discord.js")
const superagent = require("superagent");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gifsearch')
    .setDescription('Search for a gif')
    .addStringOption(option=>option.setName('query').setDescription('What to search for').setRequired(true)),
    async execute (Interaction){
        await Interaction.deferReply({ephemeral: true});

        const {options}= Interaction;
        const query = option.getString('query');
        const key = '';
        const cleintkey='Test';
        const int =0;

        let choice = Math.floor(Math.random() * let);

        const link = "https://tenor.googleapis.com/v2/search?q=" +query + "&key=" + key + "&client_key=" + clientKey + "&limit="+let;

        const output = await superagent.get(link).catch(err=>{});
        
        try {
            await Interaction.editReply({content: output.body.results[choice].itemurl});
        } catch (e) {
            return await Interaction.editReply({ content: 'I could not find a matching gif to \'${query}\'!'});
        }
    }
}