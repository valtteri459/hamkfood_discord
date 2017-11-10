const discord = require("discord.js");
const http = require("https");
const schedule = require("node-schedule");
console.log(schedule);

const client = new discord.Client();
const config = require("./config");
var postChannels = config.predetermined;

client.on('ready', () => {
    console.log('I am ready!');
    client.generateInvite(["SEND_MESSAGES", "MENTION_EVERYONE", "READ_MESSAGES", "CHANGE_NICKNAME", "ATTACH_FILES"]).then(link => {
        console.log("invite link: ", link);
    });
    client.user.setGame("!listen and !stopListen");
    function getFoods() {
        console.log("fetching foods");
        http.get("https://www.amica.fi/modules/json/json/Index?costNumber=0831&language=fi", (resp) => {
            var data = "";
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try{
                    var list = JSON.parse(data);
                    var foods = list.MenusForDays;
                    for(var j = 0;j<foods.length;j++){
                        var foodDate = new Date(foods[j].Date);
                        var nowDate = new Date();
                        if(foodDate.setHours(0,0,0,0) == nowDate.setHours(0,0,0,0)){
                            var fieldData = [];
                            var todaysMenu = foods[j];
                            for(var x = 0;x<todaysMenu.SetMenus.length;x++){
                                var embedField = {name: todaysMenu.SetMenus[x].Name, inline: true};
                                var contents = "";
                                for (var c = 0; c < todaysMenu.SetMenus[x].Components.length;c++){
                                    contents += todaysMenu.SetMenus[x].Components[c]+"\n";
                                }
                                embedField["value"] = contents;
                                fieldData.push(embedField);
                            }
                            var embeddedFoodlist = {
                                color: 3447003,
                                author: {
                                    name: client.user.username,
                                    icon_url: client.user.avatarURL
                                },
                                title: "available food at Vi-C campus",
                                url: "https://hamk.noire.io",
                                description: "luch offerings for 2.60€ per student",
                                fields: fieldData,
                                timestamp: new Date(),
                                footer: {
                                    icon_url: client.user.avatarURL,
                                    text: "copyright LOLOL"
                                }
                            };

                            for (var i = 0; i < postChannels.length; i++) {
                                client.channels.get(postChannels[i]).send({embed: embeddedFoodlist});
                            }
                        }  
                    }
                }catch(e){
                    console.log(e);
                }
            });
            resp.on("error", (err) => {
                console.log("UNABLE TO FETCH DATA FROM AMICA :C");
            });
        });
    }
    getFoods();
    schedule.scheduleJob("6 30 * * *", ()=>{getFoods()});
});

client.on('message', message => {
    if (message.content === '!listen') {
        var channId = message.channel.id;
        if(postChannels.indexOf(channId) < 0){
            postChannels.push(channId);
        }
        message.reply('channel added to listen for food updates');
    }
    if (message.content === '!stopListen') {
        var channId = message.channel.id;
        var index = postChannels.indexOf(channId);
        if (index > -1) {
            postChannels.splice(index, 1);
        }
        message.reply('channel removed from the listening list');
    }
});


client.login(config.key);