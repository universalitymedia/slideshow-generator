// Edit this file to change what the generator can produce.
// Hooks open the slideshow, tips fill the middle, CTAs close it.

export type TopicId = "home" | "moving" | "going-out" | "commuting";
export type PersonaId = "dad-cop" | "nurse-sister" | "dispatcher-cousin" | "self-defense";

export const TOPICS: { id: TopicId; label: string }[] = [
  { id: "home", label: "Home & online" },
  { id: "moving", label: "Moving & apartments" },
  { id: "going-out", label: "Going out & dating" },
  { id: "commuting", label: "Commuting & travel" },
];

export const PERSONAS: { id: PersonaId; label: string }[] = [
  { id: "dad-cop", label: "My dad, the cop" },
  { id: "nurse-sister", label: "My sister, an ER nurse" },
  { id: "dispatcher-cousin", label: "My cousin, a 911 dispatcher" },
  { id: "self-defense", label: "My self-defense instructor" },
];

export interface Hook {
  persona: PersonaId;
  topic: TopicId;
  text: string;
}

export const HOOKS: Hook[] = [
  { persona: "dad-cop", topic: "home", text: "My dad worked s*x crimes for 15 years. He made me promise to follow these" },
  { persona: "dad-cop", topic: "home", text: "My dad is a cop and he would lose it if he saw how much I share online. Do these instead" },
  { persona: "dad-cop", topic: "moving", text: "My dad is a cop and refuses to let me sign a lease until I do these" },
  { persona: "dad-cop", topic: "moving", text: "My dad has seen what happens after a move-in. These are his rules" },
  { persona: "dad-cop", topic: "commuting", text: "My dad is a cop and these are the rules he drilled into me before I started commuting" },
  { persona: "dad-cop", topic: "going-out", text: "My dad is a cop and I am not allowed to go on a first date without doing these" },

  { persona: "nurse-sister", topic: "going-out", text: "My sister is an ER nurse. These are the safety habits she wishes every girl had on a night out" },
  { persona: "nurse-sister", topic: "going-out", text: "My sister works nights in the ER and begged me to do these before every date" },
  { persona: "nurse-sister", topic: "commuting", text: "My sister is an ER nurse and she told me to stop doing these things when I travel alone" },
  { persona: "nurse-sister", topic: "home", text: "My sister is an ER nurse and she made me change these settings the same night" },

  { persona: "dispatcher-cousin", topic: "home", text: "My cousin is a 911 dispatcher. These are the things she would never post online" },
  { persona: "dispatcher-cousin", topic: "moving", text: "My cousin is a 911 dispatcher and says everyone should do these in a new place" },
  { persona: "dispatcher-cousin", topic: "commuting", text: "My cousin is a 911 dispatcher and these are the calls she wishes never happened" },
  { persona: "dispatcher-cousin", topic: "going-out", text: "My cousin is a 911 dispatcher. Her rules for meeting someone new" },

  { persona: "self-defense", topic: "going-out", text: "My self-defense instructor said these matter more than any move she teaches" },
  { persona: "self-defense", topic: "commuting", text: "My self-defense instructor taught us these before she taught us a single technique" },
  { persona: "self-defense", topic: "moving", text: "My self-defense instructor told our whole class to do these the day we move in somewhere new" },
  { persona: "self-defense", topic: "home", text: "My self-defense instructor says the best defense is not being easy to find. Start here" },
];

export interface Tip {
  topic: TopicId;
  text: string;
}

export const TIPS: Tip[] = [
  // Home & online
  { topic: "home", text: "Set up your phone's Emergency SOS feature and add emergency contacts so help can be reached quickly if you can't make a call." },
  { topic: "home", text: "Turn location off for your camera and not just for one app. Every photo you take saves where you took it, and that stays on the picture when you send it to someone. It is one setting on your phone. Once it is off you never have to think about which photo gave away your street." },
  { topic: "home", text: "Never post a photo of your meal, your concert view, or your gym mirror selfie while you are still there. Post it after you have left. Real-time posting tells anyone watching exactly where you are right now." },
  { topic: "home", text: "Check what is visible in the background of your photos. Street signs, house numbers, mail and the view from your window can all point to where you live." },
  { topic: "home", text: "Keep your profile private and review your followers. If you do not know someone, they do not need to see your daily routine." },
  { topic: "home", text: "Do not drop your home address in group chats or public reviews with people you have not met in person." },
  { topic: "home", text: "Use a different email for shopping and social accounts so one leaked address cannot be used to track you everywhere." },
  { topic: "home", text: "Do not post your travel plans. Share the trip after you are back, so a stranger can't tell your home is empty." },

  // Moving & apartments
  { topic: "moving", text: "The \"Say We\" rule. Never confirm to anyone that you live alone. Not the delivery driver, not the locksmith, not the chatty stranger in the elevator. Say \"we\" like it is grammar: \"We just moved in.\" It costs nothing, and it quietly closes the one door every bad plan needs open." },
  { topic: "moving", text: "When you get to your apartment, don't turn the lights on immediately, because if you're being followed by a creep, the light can let them know exactly where you live." },
  { topic: "moving", text: "Change or re-key the locks the day you move in. You have no idea how many spare keys are floating around from past tenants." },
  { topic: "moving", text: "Do not put your full name on your mailbox or door. A last name or just initials is enough for the mail carrier." },
  { topic: "moving", text: "Walk the building at night before you sign. Check the lighting, the entrances, and whether the doors lock behind you." },
  { topic: "moving", text: "Never hold the door for someone you do not recognize. It feels rude. It is also how most building break-ins start." },
  { topic: "moving", text: "Keep your blinds angled so people outside can't see in, but you can still see out." },
  { topic: "moving", text: "Learn the exits and the nearest well-lit public place around your new home in the first week." },

  // Going out & dating
  { topic: "going-out", text: "Meet in a busy public place you chose, and get there on your own. Never let a first date pick you up from home." },
  { topic: "going-out", text: "Share your live location with one friend and tell them who you are with, where, and when you will check in." },
  { topic: "going-out", text: "Keep your drink in your hand or in your sight at all times. If it leaves your sight, order a new one." },
  { topic: "going-out", text: "Set a check-in text with a friend, and agree on a code word that means \"come get me\" with no questions asked." },
  { topic: "going-out", text: "Reverse image search their photos and look them up before you meet. If their story does not line up, that is your answer." },
  { topic: "going-out", text: "Do not share your address, workplace or daily routine until you have really gotten to know someone. A good person will wait." },
  { topic: "going-out", text: "Trust the weird feeling. You do not owe anyone an explanation for leaving early." },
  { topic: "going-out", text: "Plan your own ride home before you go out, and keep your phone charged. A dead phone is the worst moment to need it." },

  // Commuting & travel
  { topic: "commuting", text: "Keep one earbud out when you walk alone. Being able to hear what is around you is a real safety tool." },
  { topic: "commuting", text: "Share your trip in your ride app with a friend, and check that the plate and driver match before you get in." },
  { topic: "commuting", text: "Sit near the driver or the doors on public transport, and move if someone makes you uncomfortable." },
  { topic: "commuting", text: "Have your keys in your hand before you reach your car or your door, not buried in your bag." },
  { topic: "commuting", text: "Park under lights and near the exit. Take a quick look in your back seat before you get in." },
  { topic: "commuting", text: "Vary your route when you can. A predictable schedule is easy for someone to learn." },
  { topic: "commuting", text: "When you check into a hotel, ask for a room that is not on the ground floor and do not say your room number out loud." },
  { topic: "commuting", text: "Do not post your travel in real time. Share the photos once you are home safe." },
];

export const CTAS: string[] = [
  "Before I moved into my place, I checked the area on Warden. It maps registered s*x offenders who may be living near any address, so you know who could be around you before you sign anything.",
  "Before you go anywhere new, check the address on Warden. It shows registered s*x offenders who may be living nearby, so you walk in already informed.",
  "Warden maps registered s*x offenders around any address. Check your block, your new place or your kid's school before you need to wonder.",
  "Download Warden and look up your area tonight. Knowing who lives nearby takes a minute, and it changes how you move through your neighborhood.",
  "I put Warden on my phone the week I moved. It shows registered s*x offenders near any address, so I always know what is around me. Link in bio.",
];

export interface Sound {
  title: string;
  artist: string;
  url?: string; // link to the exact sound, if known
}

export const SOUNDS: Sound[] = [
  { title: "Meet you at the Graveyard unreleased", artist: "Cleffy" },
  { title: "Espresso", artist: "Sabrina Carpenter" },
  { title: "BIRDS OF A FEATHER", artist: "Billie Eilish" },
  { title: "Too Sweet", artist: "Hozier" },
  { title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars" },
];

export interface Caption {
  topic: TopicId;
  title: string; // the bold line above the post
  text: string; // the description, before hashtags
}

export const CAPTIONS: Caption[] = [
  { topic: "home", title: "stop posting these", text: "one setting and one habit took me two minutes and made me so much harder to find. check your camera location first. i checked my area on warden after." },
  { topic: "home", title: "your photos know where you live", text: "turn the location off for your camera, not just one app. then look at what is in your background before you post. it is easier than it sounds." },
  { topic: "home", title: "settings to change tonight", text: "i did these on a tuesday night and haven't thought about them since. save this for when you have five minutes." },

  { topic: "moving", title: "things to do before you move in", text: "start with the neighbours. i ran the address through warden first. then the locks, the lighting and the deliveries. it is a ten minute checklist and you will be so glad you did it." },
  { topic: "moving", title: "new apartment rules", text: "say we, not i. change the locks. check the area on warden before you sign anything. send this to someone who is moving soon." },
  { topic: "moving", title: "before you sign the lease", text: "walk the building at night, check the block on warden, and ask who has keys. nobody tells you to do this stuff until after." },

  { topic: "going-out", title: "first date safety, the real version", text: "public place, your own ride, and one friend who knows the plan. none of this is paranoid. it is just smart. save it for your next date." },
  { topic: "going-out", title: "do this before you go out tonight", text: "share your location, agree on a code word, and keep your drink in your hand. send this to the friend who always forgets." },
  { topic: "going-out", title: "the rules i wish i knew sooner", text: "trust the weird feeling and plan your own way home. you never owe anyone an explanation for leaving." },

  { topic: "commuting", title: "walking home alone? read this", text: "one earbud out, keys in your hand, and share your trip. small things that add up. i check new areas on warden before i travel." },
  { topic: "commuting", title: "travel safety for solo girls", text: "ask for a room off the ground floor, never say your room number out loud, and post the photos after you are home." },
  { topic: "commuting", title: "my commute rules", text: "park under lights, vary your route, and know where the exits are. look up the area on warden if it is somewhere new." },
];

export const HASHTAGS: Record<TopicId, string[]> = {
  home: ["#safetytips", "#onlinesafety", "#privacy", "#wardenapp"],
  moving: ["#safetytips", "#onlinesafety", "#livingalone", "#womenssafety", "#wardenapp"],
  "going-out": ["#safetytips", "#datingsafety", "#womenssafety", "#wardenapp"],
  commuting: ["#safetytips", "#travelsafety", "#womenssafety", "#wardenapp"],
};
