# Working Area

## General Stuff
### Language & core idea:
- Javascript, Discord.js
- tendency towards using slash commands
  Wilson:
  - it would be a pain to support both slash and text commands
  - discord no longer likes text commands and want to remove message content for just text commands

### Database ideas:
- enmap
- josh
- sql (mysql, mariadb, pgsql)

### Code basis ideas:
<ins>Wilson:</ins>
- Guidebot https://github.com/AnIdiotsGuide/guidebot (and guidebot class)
  - Simple to use, and modify. Has the basics for what you would want, args. flags and perms for commands, Has the base event handler, command handler and slash command handler (but slash commands are a bit weird.) Also by default includes a db for misc stuff so no setup needed.
- Sapphire https://www.sapphirejs.dev/
  - A well developed framework. A bit more on the complex side of things but has some nicer features, such as better args parsing (read quotes as one arg, arg types, read between x and y args), really nice to use flags (use anywhere, provide data options, have multiple of the same name, disable or enable on a per command basis), custimizable perm system. Handles events and slash (next branch only rn) and chat commands. Code can get a bit complex and might have to install a bunch of modules
- iislander https://github.com/iiow/iislander
  - the event handling is a bit funky, but nothing crazy, Command handling is mediocre (arg parsing only) and no slash command support at all (need to write it yourself).

<ins>Other ideas:</ins>

### Name ideas:
- Jam Bot

### Hosting ideas:
- root Server, Raspberry Pi (Lucy)

## Functionality Explained
### Basics 
- Input system
  - slash commands
  - text commands
- Output system
  - embeds
  - reactions
  - direct messages

### Poll system 
- Input
  - starting a poll
  - inputing the settings (voting start/end, number of votes, jam start/end)
    - templates for the settings (next sunday start, voting two days before that etc.)
  - new proposals for the polls with a choosen emoji as identifer 
  - deleting proposals (only valid for your own proposal and for the admins)
  - controlls for the admins to change the inputs of others if necessary
  
  - format idea:
    /proposal [...]
    - add [title] [description] [sources]
    - remove [title]
    - list --> returns a list of all proposals
    
    /create [...]
    - fromTemplate [templateName] --> returns settings

- Logic
  - save the proposals
  - creating polls on request
    - discarding proposals that were least voted last time when there are more then a number of ideas
    - saving the poll and all its data when created
  - reading the reactions and saving changes
  - limiting the number of votes
    - removing unvalid votes and notifing the person
  - timing polls (checking if time is over etc.)
  - evaluating the poll
- Output
  - publishing polls and adding reactions
    - date, number of votes, start/end, proposals in embed
  - sharing the winner of the poll
  - ping/reminder when the jam starts

### Reaction roles
- color roles 
  - changing the colors
  - creating the roles (with the right hirachy)
  - outputing the availabe colors to choose from
- interest roles (roles for programming language, systems etc. - also by reactions)
  - creating the roles
  - match the emojis with the logos to the things
  - creating a selection message

### Channels 
- creating a result channel with the right name when a jam starts
- moving them to the results archive