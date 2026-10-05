/**
 * How a theme presents guided descriptions in the artifact popup.
 * "combined" folds the guided text into the artifact's body paragraphs with no
 * guided heading. "sections" stacks every image's guided description in one
 * scrollable panel under type-derived headings.
 */
export const DESCRIPTION_MODE_COMBINED = "combined";
export const DESCRIPTION_MODE_SECTIONS = "sections";

/** Per-letter guided sections (e.g. student letters); each entry is one letter. */
export const GUIDED_DESCRIPTION_MODE_LETTERS = "letters";

/** Per-image guided sections for multi-page docs with distinct page copy. */
export const GUIDED_DESCRIPTION_MODE_PER_IMAGE = "per-image";

export const themes = {
  "change": {
    "id": "change",
    "number": 1,
    "label": "Change",
    "descriptionMode": DESCRIPTION_MODE_SECTIONS,
    "quote": "“The power of effecting changes for the better is within ourselves, not in the favorableness of circumstances.” - Helen Keller, 1923",
    "description": "Helen Keller was a life-long advocate for change across society. Beginning with her fundraising campaign as a 10-year-old student, Helen was an advocate for voting, labor, and economic rights, in addition to working for several decades to advocate for people who were blind and deafblind.",
    "iconAlt": "A black and white photo layered over documents shows Helen visiting veterans at a military hospital.",
    "artifacts": [
      {
        "id": "1A1",
        "title": "Video of Korean War Visit, 1953",
        "displayTitle": "Korean War Veteran Visit",
        "year": "1953",
        "description": "Helen once stated that the work she did with veterans was the crowning experience of her life. Helen worked with wounded veterans from the First World War through the Korean War, as shown in this black-and-white film from 1953, in which Helen and Polly Thomson visit hospitalized veterans.",
        "type": "video",
        "videoSrc": "1A1VeteranVid.mp4",
        "posterSrc": "1A1VeteranVid_frame.png",
        "alt": "A black-and-white image shows Helen laughing with a man in a hospital.",
        "images": [],
        "transcriptTitle": "Transcript",
        "transcriptText": "Male audio description: In a medical institution, Helen and Polly stand aside men sitting on hospital beds.\nFemale narrator: The newly handicapped, the once whole young men who have come back from Korea disabled, these command as much as attention from Helen as did their brothers in the Second World War.  \nMale audio description: She leans near a soldier.\nFemale narrator: Then as now she and Polly tramp the endless corridors of our military hospitals, bringing hope to the amputees, the blind, and the disabled.\nMale audio description: Helen gently touches the man’s hair and face. The man grins and laughs with Helen.\nFemale narrator: Meeting Helen, seeing what she has made of her life, gives them more courage to reshape their own.\nMale audio description: Polly translates into Helen’s hand as they stand near the men.\nFemale narrator: For her services she was cited at the close of World War Two."
      },
      {
        "id": "1A2",
        "title": "IWW Conspiracy Speech, 1918",
        "displayTitle": "IWW Conspiracy Speech",
        "year": "1918",
        "description": "In one of her most passionate political writings, Helen’s 1918 speech defending The Industrial Workers of the World, a labor union and “movement of revolt,” states that IWW opponents did everything from labeling them as “dangerous foreigners” to accusing them of kidnapping and murder.  Helen joined the IWW in 1916, saying traditional political parties moved too slowly and didn't protect laborers.",
        "type": "document",
        "alt": "A yellowed sheet of paper shows the first page of Helen's typed IWW Speech.",
        "images": [
          {
            "src": "1A2IWW1.png",
            "alt": "Page 1 of Helen Keller’s IWW Conspiracy Speech, 1918",
            "guidedDescription": "A yellowed sheet shows the first of five pages of Helen's typed IWW speech. A central crease marks where it was once folded. Pencil in the top right corner notes \"Speeches 1918, Industrial Workers of the World.\" Holes in the top left corner show where pages were bound."
          },
          {
            "src": "1A2IWW2.png",
            "alt": "Page 2 of Helen Keller’s IWW Conspiracy Speech, 1918",
            "guidedDescription": "A yellowed sheet shows the second of five pages of Helen's typed IWW speech. A central crease marks where it was once folded. The number 2 appears in the top right corner. Holes in the top left corner show where pages were bound."
          },
          {
            "src": "1A2IWW3.png",
            "alt": "Page 3 of Helen Keller’s IWW Conspiracy Speech, 1918",
            "guidedDescription": "A yellowed sheet shows the third of five pages of Helen's typed IWW speech. A central crease marks where it was once folded. The number 3 appears in the top right corner. Holes in the top left corner show where pages were bound."
          },
          {
            "src": "1A2IWW4.png",
            "alt": "Page 4 of Helen Keller’s IWW Conspiracy Speech, 1918",
            "guidedDescription": "A yellowed sheet shows the fourth of five pages of Helen's typed IWW speech. A central crease marks where it was once folded. The number 4 appears in the top right corner. Holes in the top left corner show where pages were bound."
          },
          {
            "src": "1A2IWW5.png",
            "alt": "Page 5 of Helen Keller’s IWW Conspiracy Speech, 1918",
            "guidedDescription": "A yellowed sheet shows the fifth and final page of Helen's typed IWW speech. A single paragraph is signed off with Helen's typed name beneath it. A central crease marks where it was once folded. The number 5 appears in the top right corner. Holes in the top left corner show where pages were bound."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Handwritten: Speeches 1918 Industrial Workers of the World]\nThe \"I. W. W.\" Conspiracy [handwritten: -c]\nSpoken on January 27, 1918. [handwritten: workers union -c]\nI am going to talk about the Industrial Workers of the World because [handwritten: -c] they are so much in the public eye just now. They are probably the most loved and the most hated organization in existence. Certainly they are the most persistently misunderstood and misrepresented.\nThe \"Industrial Workers of the World\" is a labor union based on the class struggle. It admits only wage-earners and acts on the principle of industrial unionism. It is a movement of revolt against the poverty, the cruelty and the ignorance that so many of us accept in blind content. [typed over with x's: The symbols]\nIts battle-ground is the field of industry. The symbols of the battle are the strike, the lock-out and the clash between employer and employed. It was founded in 1905 by men of bitter experience in the labor struggle, and in 1909 it began to attract nationwide attention. The McKee's Rocks strike first brought it to notice. [handwritten: -c] The textile strike of Lawrence, Massachusetts, the silk workers' strike of [handwritten: c] Paterson, New Jersey and the miners' strike of Calumet, Michigan, made it notorious. Since 1909 it has been a militant force in America that employers have had to reckon with.\nIt differs from the trade unions in that it emphasizes the idea of one big union in all the fields of industry. It points out that the trade unions as at present organized are an obstacle to unity among the masses, and that this lack of solidarity plays them into the hands of their economic masters.\nThe \"I. W. W.\" [strikethrough: \"I. W. W.'s\"] affirm [strikethrough: affirms] a fundamental principle that the creators of wealth are entitled to all they create. Thus they find themselves pitted against the whole profit-making system. They declare that there can be no compromise so long as the majority of the workers live in want, while the master class lives in luxury. They insist that there can be no peace until the workers organize as a class, \"take possession of the resources of the earth and the machinery of production and distribution and abolish the wage-system.\"\nIn other words, the workers in their collectivity must own and operate all the essential industrial institutions and secure to each laborer the full [strikethrough: product] value of his product. It is for these principles, this declaration of class solidarity that the \"I. W. W.'s\" are being persecuted, beaten, imprisoned and murdered.\nLet me tell you something about the \"I. W. W.'s\" as I see them. They are the unskilled, the unnaturalized, the ill-paid, the submerged part of the working-class. They are mostly mill-workers, harvesters, lumber-men, miners and transport workers. We are told that they are \"foreigners,\" \"the scum of the earth,\" \"dangerous.\" [strikethrough: Many of them]\n\"Foreigners,\" many of them are simply because the greater part of the unskilled labor in this country is foreign. \"Scum of the earth?\" Perhaps. I know they have never had a fair chance. They have been starved in body and mind, denied, driven like slaves from job to job.\n\"Dangerous?\" May be. They know that the laws are for the strong, that they protect the class that owns everything. They know that in a contest with the workers employers do not respect the laws, but quite shamelessly break them* Witness the lunching of Frank Little in Butte, Montana, the flogging of seventeen men in Tulsa, Oklahoma, the forcible deportation of twelve hundred miners from Bisbee, Arizona, the burning to death of women and little children in the tents of Ludlow and the massacre of workers in Trinidad, Colorado. So the \"I. W. W.'s\" respect the laws only as a soldier respects an enemy.\nCan you find it in your hearts to blame them? I love them because of their needs, their miseries and their daring spirit. It is because of this spirit that the master class fears and hates them, and the poor and oppressed love them with a great love.\nThe oft-repeated charge that the \"I. W. W.\" is organized to hinder industry is false. It is organized to keep industries going. By organizing industrially they are \"forming the structure of the new society in the shell of the old.\"\nIndustry rests on the iron law of economic determinism. All history reveals the fact that economic interests are the strongest ties that bind men together. That is not because men's hearts are evil and selfish. mIt[sic] is only a result of the inexorable law of life. The desire to live is the basic principle that compels men and women to seek a more suitable environment, so that they may live better and more happily.\nNow, don't you see, it is impossible to maintain an economic order that keeps wages practically at a standstill, while the cost of living mounts higher and ever higher? The day will come when the tremendous activities of the War will subside. The master class will inevitably find itself face to face with a starving multitude of unemployed workers demanding food, or the destruction of the social order that has starved them and robbed them of their jobs.\nIn such a crisis the master class cannot save itself. Its police and its armies will be powerless to put down the last revolt. For at last man will take his own, nor count the cost.\nWhen that day dawns, if the workers are not thoroughly organized, they may easily become a blind force of destruction, unable to check their own momentum, their cry for justice drowned in a howl of rage. Whatever is good and beneficent in our civilization can be saved only by the workers, and the \"I. W. W.\" is formed with, the object of carrying on the work of the world when capitalism is overthrown.\nWhether the \"I. W. W.\" increases in power, or is crushed out of existence, the spirit that animates it is the spirit that must animate the labor movement if it is to have a revolutionary function.\nDown through the long, weary years the will of the master class has been domination and suppression, either of the man or his message, especially if the man or his message antagonized its interests. From the execution of the propagandist to the suppression of the writer, down through the various degrees of censorship and expurgation to the highly civilized legal indictment, the cry has ever been \"Crucify him.\"\nNow the master class has willed into jail one hundred and sixty-six \"I. W. W.\" officers, members and sympathizers. They are in Chicago, [handwritten: -c] awaiting trial on the charge of conspiracy.\nWhile they are meeting the hardest ordeal, while the jury is trying to weigh the evidence, how shall we feel towards them? Shall our attitude be one of anger and vengeance, or one of sympathy and justice? Shall we throw into the scale the fighting sword of hate?\nFor my part, I sympathize with them. While they are threatened and imprisoned, I am manacled. If they are denied a living wage, I, too, am defrauded. My hunger is not satisfied while they are unfed. I cannot enjoy the good things of life that come to me while they are hindered and neglected. When they are flung out upon a desert under a scorching sun, I, too, burn, and my soul is athirst. When one of them is dragged from his bed and hung to a railroad trestle, a great horror of darkness falls upon my spirit, and from the depths of my heart I cry out against those who persecute the weak and unfriended.\nNext month, those one hundred and sixty-six \"I. W. W.'s\" will be tried in a government court. The newspapers will be full of stupid, if [handwritten: press] not malicious accounts of the trial.\nLet us keep an open mind. Let us try to preserve the integrity of our judgment against the ignorance, misrepresentation and [strikethrough: prejudice] cowardice of the day. Let us refuse to yield to lies and censure. Let us keep our hearts tender towards those who are struggling mightily against the greatest evils of the age.\nHelen Keller",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "1A3",
        "title": "Women’s Suffrage Speech, 1920",
        "displayTitle": "Women’s Suffrage Speech",
        "year": "1920",
        "description": "Helen wrote in this 1920 speech, called \"Why Woman Wants to Vote\", in support of the 19th Amendment, which was passed later that year. Helen argues in this speech that women's right to vote, along with all other rights, are only earned when we are strong enough to claim them for ourselves, as evidenced by this quote: “Today women are asserting their rights, tomorrow nobody will be foolhardy enough to question them.”",
        "type": "document",
        "alt": "A yellowed sheet of paper with torn edges and corners shows the first page of Helen's typed speech about women's voting rights.",
        "images": [
          {
            "src": "1A3Suffrage1.png",
            "alt": "Page 1 of Helen Keller’s Women’s Suffrage Speech, 1920",
            "guidedDescription": "A yellowed, torn sheet shows page one of Helen's typed speech on women's voting rights. Holes in the top left corner show where pages were bound. The title, \"Why Woman Wants to Vote,\" is underlined in red. Faded pencil fills the top margin. Pencil brackets surround one sentence that reads 'Perhaps one of the chief reasons for the chaotic condition of things is that the world has been trying to get along with only half of itself. The two parts are unlike, and it takes both to make a whole.'"
          },
          {
            "src": "1A3Suffrage2.png",
            "alt": "Page 2 of Helen Keller’s Women’s Suffrage Speech, 1920",
            "guidedDescription": "A yellowed, torn sheet shows page two of Helen's typed speech on women's voting rights. Holes in the top left corner show where pages were bound. Pencil marks throughout indicate text changes and places for emphasis."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "Why Woman Wants to Vote.\n[Handwritten note at top of page: illegible]\n[Handwritten: H.K. Speeches 1920 \"Why woman wants to vote\" 1920 Speeches 1920]\nWe demand the vote, not because we think we are better or wiser than men, but because it is our right as much as it is theirs. And even if we all vote together, we cannot abuse this right more than the men have done by themselves. There is already a good deal wrong with the world-- any one who reads at all intelligently knows that. Perhaps one of the chief reasons for the chaotic conditions of things is, that the world has been trying to get along with only half of itself. The two parts are unlike, and it takes both to make a whole. [Handwritten brackets around this sentence; purpose unclear] We demand the vote for women because it is in accordance with the principles of a true democracy. Many labor under the delusion that we live in a democracy. I have to smile-- several ways-- when I read that ours is \"a government of the people, by the people, and for the people.” We are neither a democracy nor a true representative republic. We are a government of parties and partisans, and lo, at least half the adult population may not even belong to these parties! We demand woman suffrage also because without it women cannot protect themselves and their children. Some people like to imagine that the chivalrous nature of man will constrain him to act humanely towards woman and protect her rights. SOME men do protect some women. We demand that all women have the right to protect themselves. Political power intelligently used, enables the citizen to direct and shape the legal affairs of the state and determine what shall be the relations of human beings to each other, individually and collectively. Without this power, women who do not happen to have a \"natural protector\" are at the mercy of man-made laws, and experience shows that these laws are often unjust to them. In some states of this \"enlightened democracy\" of men the father is the sole owner of the child. I believe he can even will away the unborn babe. In some states women cannot hold property, and their wages belong to their fathers or their husbands. Legislation concerning the age of [Handwritten caret mark between sentences; purpose unclear] consent is another proof that the voice of woman is mute in the halls of the law-makers. Surely, women are not isolated beings, puppets in the world to be manipulated by men.\n)Put this after sentence about tyranny wearing mask 3/4 Anyway, the fight is on, and I advise [Handwritten edit: any] men who [Handwritten edit: is] still hesitating [sic.] to hurry [handwritten: up] and get on the right side. For there will soon be a terrific struggle between democracy and autocracy-- as a matter of fact, it has begun,\nTheir old-fashioned ideas are up a tree, and traditions are breaking up, and the new plans are arriving. It is time to take a good look.\n) After sentence about men and women working together to solve problems We do not want a woman’s world or a man’s [deleted: either], but a human world no longer cursed by misery, ignorance, disease and crime. We want a world where there is fair play in every relation of life-- an equitable [strikethrough: inelligble] distribution of human comfort and happiness, a just amount of labor for every one, a real living wage, the security of every worker from oppression of one or many, and. [handwritten: underline of \"Everywhere\"] Everywhere, in all countries, in all classes we see woman-force running to waste that should be utilized in making the world a decent home for all humanity.\n) Last paragraph, I think 3/4 There are no such things as \"divine, immutable, inalienable rights.\" Rights are things which we get when we are strong enough to make our claim to them good. Today women are asserting their rights tomorrow nobody will be foolhardy enough to question them. [handwritten curly bracket around this paragraph]",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "1A4",
        "title": "Letter from the ACLU, 1919",
        "displayTitle": "Letter from the ACLU",
        "year": "1919",
        "description": "By 1919, Helen was already sought after for her advocacy work. In this letter to Helen from The National Civil Liberties Bureau, key members of the organization write to Helen to share their plans for reorganization and to ask her to join them, insisting they want her to be an active member in their future work. Helen became a founder of the American Civil Liberties Union, which grew out of the National Civil Liberties Bureau.",
        "type": "document",
        "alt": "A yellowed sheet of paper shows the first page of a typed letter to Helen from the National Civil Liberties Bureau.",
        "images": [
          {
            "src": "1A4ACLU1.png",
            "alt": "Page 1 of letter from the ACLU to Helen Keller, 1919",
            "guidedDescription": "A yellowed sheet of National Civil Liberties Bureau letterhead, dated December 30, 1919, shows a typed letter to Helen at Forest Hills, Long Island. Blue printed lists of officers and directing committee members flank the top corners. Faint pencil marks lie beneath the committee list. Torn holes show where pages were bound."
          },
          {
            "src": "1A4ACLU2.png",
            "alt": "Page 2 of letter from the ACLU to Helen Keller, 1919",
            "guidedDescription": "A yellowed sheet shows the second page of a letter to Helen from the National Civil Liberties Bureau. Typed paragraphs end about halfway down the page. Beneath them are four signatures of the organization's officers. Torn holes in the top left corner show where pages were bound."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Printed letterhead] OFFICERS L. Hollingsworth Wood, Chairman Norman M. Thomas, Vice Chairman Helen Phelps Stokes, Treasurer Albert De Silver, Director Paul J. Furnas, Associate Director Walter Nelles, Counsel\n[Printed Letterhead] NATIONAL CIVIL LIBERTIES BUREAU 41 UNION SQUARE, NEW YORK\n30-Dec-19\n[Printed letterhead] DIRECTING COMMITTEE The Officers and Roger N. Baldwin John S. Codman Crystal Eastman John Lovejoy Elliott Edmund C. Evans Edward W. Evans William M. Fincke John Haynes Holmes Agnes Brown Leach Judah L. Magnes John Nevin Sayre\nMiss Hellen Keller, Forest Hills, L.I. Dear Miss Keller:-\nWe desire to get your active co-operation in completely reorganizing the work of this Bureau, to aid in the present struggles of labor for freedom of speech, press and assemblage. First let us put before you the essential facts about the Bureau.\nThe Bureau was organized during the war to deal with war-time problems of freedom of opinion and of conscience. It was not an anti-war organization. It simply insisted on American constitutional rights for those who were opposed to the war. Among its supporters and directing committee were persons who vigorously supported the war, though the state of public opinion made it possible to secure the active support of only a few such. The Bureau’s work for persons and groups attacked under war statutes has now practically ended. There remains only the effort to secure an amnesty for political, industrial and military prisoners, including the few score conscientious objectors still in prison.\nBut a vastly bigger work in the struggle for civil liberty has opened up. It is a challenge to every believer in industrial democracy, to every champion of free expression of opinion. Our little group cannot effectively serve so great a need.\nWe have therefore decided to completely reorganize the Bureau’s work by inviting the persons whose names appear on the enclosed list to associate themselves together in a new organization. We are asking those who can do so to meet in conference on Monday, January 12th, 1920, at the Civic Club, 14 West 12th Street, New York City, for luncheon, at 1 ’ clock to effect the reorganization of the work. The present assets, records and organization of the Bureau will be put entirely at the disposal of the new group. A statement of the issue, the work and the plans as we see them now, is enclosed.\n-2- F.K. -\nWe ask you to join this group. This is no perfunctory request for \"the use of your name\". Your active service in shaping the policies of the new work is urgently needed. Members who cannot come to meetings would be consulted by letter. All the details would be handled by a local directing committee in New York City, The service of other members of the national committee would consist in giving their judgment on matters of policy and publicly backing the work for civil liberty in the industrial struggle. We cannot take \"no\" for your answer without the most evident reasons. Rather than take your declination to serve we will go to put the case before you personally. The emergency is too real, the challenge too clear, the service too great for any one of us to fail to help in what promises to be an effective piece of work in the struggle of labor. If this does not convey all the information you wish to have before making a decision, we will be glad to answer any inquiries by letter, or if practicable, by a personal visit to you. Your frank comments on the proposal and the personnel of the organization are invited. As you see what we propose in effect is a new organization to meet new issues. The present Civil Liberties group stand ready to assist in any way in which the members of the new group feel will be really helpful.\nSincerely yours, [handwritten signatures: L. Hollingsworth Wood; Norman Thomas; Albert De Silver; Roger N. Baldwin]\n[handwritten: 20, 9]",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "1A5",
        "title": "Letter to the NAACP, 1916",
        "displayTitle": "Letter to the NAACP",
        "year": "1916",
        "description": "Helen wrote to Mr. Oswald Garrison Villard, then-Vice President of the National Association for the Advancement of Colored People, in 1916 to express her solidarity with their movement: “It should bring the blush of shame to the face of every true American to know that ten of millions of his countrymen are denied the equal protection of the laws.” Helen donated $100 to the NAACP, today's equivalent of more than $3,000.",
        "type": "document",
        "alt": "A yellowed sheet of paper shows the first page of a typed letter from Helen to the NAACP.",
        "images": [
          {
            "src": "1A5NAACP1.png",
            "alt": "Page 1 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page one of seven of Helen's typed letters to the NAACP. Holes and dried glue mark the top left corner, beside a hotel logo of a dragon in a wreath above a banner reading \"The Waldo.\" Pencil adds \"Sent?\" and archival notes, plus marks throughout."
          },
          {
            "src": "1A5NAACP2.png",
            "alt": "Page 2 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page two of Helen's typed letter to the NAACP. Holes and dried glue mark the top left corner, beside a logo of a dragon in a wreath above a banner reading \"The Waldo.\" Ink marks throughout indicate changes to the text."
          },
          {
            "src": "1A5NAACP3.png",
            "alt": "Page 3 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page three of Helen's typed letter to the NAACP. Holes and dried glue mark the top left corner, beside a logo of a dragon in a wreath above a banner reading \"The Waldo.\" Ink marks throughout indicate changes to the text."
          },
          {
            "src": "1A5NAACP4.png",
            "alt": "Page 4 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page four of Helen's typed letter to the NAACP. Holes and dried glue mark the top left corner, beside a logo of a dragon in a wreath above a banner reading \"The Waldo.\" Ink marks throughout indicate changes to the text."
          },
          {
            "src": "1A5NAACP5.png",
            "alt": "Page 5 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page five of Helen's typed letter to the NAACP. Holes and dried glue mark the top left corner. Beside them, pencil reads \"To Villard, Vice President of National Association for the Advancement of Colored People.\""
          },
          {
            "src": "1A5NAACP6.png",
            "alt": "Page 6 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet of paper shows the sixth page of a typed letter from Helen to the NAACP. The top left corner features holes and dried glue where the pages were previously bound together."
          },
          {
            "src": "1A5NAACP7.png",
            "alt": "Page 7 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A yellowed sheet shows page seven, the final page, of Helen's typed letter to the NAACP. Holes and dried glue mark the top left corner. A single short paragraph of three lines of type sits on the page."
          },
          {
            "src": "1A5NAACP8.png",
            "alt": "Page 8 of Helen Keller’s letter to the NAACP, 1916",
            "guidedDescription": "A quarter sheet of paper shows a receipt for Helen's donation to the NAACP. The letterhead gives the address as 70 Fifth Avenue, New York, above the date, February 15, 1916. Typed text reads \"Received from Helen Keller, One Hundred Dollars for Donation.\" Oswald Garrison Villard signs as Treasurer."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Printed letterhead has image of a winged dragon enveloped in a garland the words \"THE WALDO\" are inside a ribbon beneath the emblem. Typeface: FIRE PROOF CLARKSBURG, West Virginia. R.J. Gazley, proprietor\n\nSent? [handwritten text]\n\nWest Virginia [handwritten]\n\n[Handwritten note: National Association for the Advance-ment of Colored People]\n\nH.K. P.R. - 1916\n\nFebruary 13, 1916.\n\nClarksburg, West Virginia, February 13, 1916\n\nMr. Oswald Garrisen Villard, Vice-President of the National Association for the Advancement of Colored People.\n\nDear Mr. Villard,\n\nIt has been my intention to write to you every day since I received your letter— an appeal which smote me to the depths of my soul. In fact, I have started several letters while travelling from place to place, but was interrupted so frequently that I lost the thread of thought between lectures. We are speaking every night and changing trains constantly. These conditions are not favorable for correspondence. [handwritten bracket before this sentence; closing bracket appears on page 4] I am indeed, wholeheartedly with you and the National Association for the Advancement of Colored People. I warmly endorse your efforts to bring before the country the facts about the unfair treatment of the colored people in some parts of the United States. What a comment upon our social justice is the need of an association like yours! It should bring the blush of shame to the face of every true American to know that ten millions of [typed: the people — struck through] [Handwritten insertion above: his countrymen] are denied the equal protection of the laws. Truly no nation can live and not challenge such discrimination and violence against innocent members of society as your letter describes. Nay, let me say it, this great republic of ours is a mockery when citizens in any section are denied the rights which the Constitution guarantees them, when they are openly evicted, terrorized and lynched by prejudiced mobs, and their persecutors and murderers are allowed to walk abroad unpunished. The United States stands ashamed before the world whilst ten millions of its people remain victims of a most blind, stupid, inhuman prejudice. How dare we call ourselves Christians? The outrages against the colored people are a denial of Christ. The central fire of his teaching is equality. His gospel proclaims in unequivocal words that the souls of all men are alike before God. Yet there are persons calling themselves Christians who profit from the economic degradation of their colored fellow-countrymen. Ashamed in my very soul I behold in my own beloved south-land the tears of those who are oppressed, those who must bring up their sons and daughters in bondage to be servants, because others have their fields and vineyards, and on the side of the oppressor is power. I feel with those suffering, toiling millions, I am thwarted with them. Every attempt to keep them down and crush their spirit is a betrayal of my faith that good is stronger than evil, and light stronger than [strikethrough: evil; handwritten: darkness]. I declare this faith every day to large audiences, and in my heart I pray that God may open the eyes of the blind, and bring them by a way they know not unto understanding and righteousness. My spirit groans with all the deaf and blind of the world, I feel their chains chafing my limbs. I am disenfranchised with every wage-slave. I am overthrown, hurt, oppressed, beaten to the earth by the strong, ruthless ones who have taken away their inheritance. The wrongs the poor endure ring fiercely in my soul, and I shall never rest until they are lifted into the light, and given their fair share in the blessings of life that God meant for us all alike. Let all lovers of justice unite, let us stand together and fight every custom, every law, every institution that breeds, or masks violence and prejudice, and permits one class to prosper at the cost of the well-being and happiness of another class. Let us hurl our strength against the iron gates of prejudice until they fall, and their bars are sundered, and we ail advance gladly towards our common heritage of life, liberty and light, undivided by race or color or creed, united by the same human heart that beats in the bosom of all. [handwritten closing bracket corresponding to opening bracket on page 1.] Cordially wishing you and the Association every success in your noble work, I am. Sincerely yours,\n\n[Handwritten: West Virginia February 1916 To: Villard, Vice President of National Association for the Advancement of Colored People]\n\nI am indeed whole-heartedly with you and the National Association for the Advancement of Colored People. I warmly endorse your efforts to bring before the country the facts about the unfair treatment of the colored people in some parts of the United States. What a comment upon our social justice is the need of an association like yours! It should bring the blush of shame to the face of every true American to know that ten millions of his country men are denied the equal protection of the laws. Truly no nation can live and not challenge such discrimination and violence against innocent members of society as your letter describes. Nay, let me say it, this great republic of ours is a mockery when citizens in my section are denied the rights which the Constitution guarantees them, when they are openly evicted, terrorized and lynched by the prejudiced mobs, and their persecutors and murderers are allowed to walk abroad unpunished. The United States stands ashamed before the world whilst ten millions of its people remain victims of a most blind, stupid, inhuman prejudice. How dare we call ourselves Christians? The outrages against the colored people are a denial of Christ. The central fire of his teaching is equality. His gospel proclaims in unequivocal words that the souls of all men are alike before God. Yet there are persons calling themselves Christians who profit from the economic degradation of their colored fellow-countrymen\n\nAshamed in my very soul I behold in my own beloved southland the tears of those who are oppressed, those who must bring up their sons and daughters in bondage to be servants, because others have their fields and vineyards, and on the side of the oppressor is power. I feel with those suffering, toiling millions, I am thwarted with them. Every attempt to keep them down and crush their spirit is a betrayal of my faith that good is stronger than evil, and light stronger than darkness. I declare this faith every day to large audiences, and in my heart I pray that God may open the eyes of the blind, and bring them by a way they know not unto understanding and righteousness. My spirit groans with all the deaf and blind of the world, I feel their chains chafing my limbs. I am disenfranchised with every wage-slave. I am overthrown, hurt, oppressed, beaten to the earth by the strong, ruthless ones who have taken away their inheritance. The wrongs the poor endure ring fiercely in my soul, and I shall never rest until they are lifted into the light, and given their fair share in the blessings of life that God meant for us all alike. Let all lovers of justice unite, let us stand together and fight every custom, every law, every institution that breeds, or masks violence and prejudice, and permits one class to prosper at the cost of the well-being and happiness of another class. Let us hurl our strength against the iron gates of prejudice until they fall, and their bars are sundered. and we all advance gladly towards our common heritage of life, liberty and light, undivided by race or color or creed, united by the same human heart that beats in the bosom of all.\n\nNational Association for the Advancement of Colored People\n\n[handwritten: for the Advancement of Colored People.]\n\n70 FIFTH AVENUE, NEW YORK\n\nFebruary 15, 1916, Received from Helen Keller One Hundred Dollars for,\n\nDonation\n\n100 dollars\n\n[Printed Stamp: Allied Printing 256 Trades Council Union Label New York City][Handwritten Signature: Oswald Garrison Villard] Treasurer",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "1A6",
        "title": "Blindness Prevention Article, 1914",
        "displayTitle": "Blindness Prevention Article",
        "year": "1914",
        "description": "Published in “The Nurse” in 1914, Helen’s article candidly discusses women who are forced into prostitution by poverty, and children who were born blind due to sexually transmitted infections. She also laments the modesty in language that prevents discussion — and ultimately prevention — of the problem.",
        "type": "document",
        "alt": "A yellowed magazine page with a torn edge shows the first page of an article written by Helen.",
        "images": [
          {
            "src": "1A6PrevBlind1.png",
            "alt": "Page 1 of Helen Keller’s Blindness Prevention Article, 1914",
            "guidedDescription": "A yellowed magazine page, page 90, shows a black-and-white portrait of Helen in a large feathered hat and white lace blouse with a ribbon brooch, looking downward beside dark flowers. Below, the title \"A Plea from Helen Keller\" heads two columns of text. Pencil notes fill the top margin."
          },
          {
            "src": "1A6PrevBlind2.png",
            "alt": "Page 2 of Helen Keller’s Blindness Prevention Article, 1914",
            "guidedDescription": "A yellowed magazine page, page 91, shows two columns of printed text under the running title \"A Plea from Helen Keller.\" Two bold section headings, \"True and False Modesty\" and \"The Cause of the Disease,\" break up the text. The left edge is ragged."
          },
          {
            "src": "1A6PrevBlind3.png",
            "alt": "Page 3 of Helen Keller’s Blindness Prevention Article, 1914",
            "guidedDescription": "A yellowed magazine page, page 92, shows two columns of printed text under the running title \"The Nurse.\" Two section headings, \"How Sight May Be Saved\" and \"Education Is Necessary,\" divide the text. The right edge is torn, and \"Incomplete\" is penciled at bottom right."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[handwritten: incomplete]\n\n[Archivist's annotation: H.K. Writing by \"A Plea from Helen Keller\" 1914?]\n\nA Plea from Helen Keller All readers of The Nurse must be familiar with the history of Miss Helen Keller. Deaf and blind since the age of nineteen months as the result of illness, Miss Keller, as author and lecturer, has become one of the prominent figures in the intellectual life of America. Naturally, her most vital interest is in lessening the terrible evil of blindness. Believing that at least twenty-five per cent of the blind lost their sight through venereal infection at birth, and that to this extent, at least, blindness is preventable, Miss Keller urges rational discussion of the cause which at birth condemns so many babies to sightless lives. She seeks to enlist the newspapers in a campaign of publicity for the prevention of blindness and while on a recent lecture tour she herself wrote the following article on her typewriter, and published it in the Kansas City Star. Miss Keller now authorizes its publication in The Nurse which she “wishes all success in its work of spreading the gospel of prevention.”—The Editor.\n\nThe purpose of this article is to discuss one of the most common causes of blindness and its prevention. I am going to tell a few plain truths about something which is a source of real danger to the eyes of new-born babies. Intelligent workers for the sightless know that much blindness is unnecessary, preventable: but many people do not know the cause or the method of prevention. We hear a great deal these days about the a social evil,” but I find that many people whom I talk with do not understand its connection with blindness and other afflictions. They are seized with a spasm of modesty when anyone tries to discuss this subject sensibly. Physicians and workers for the blind in many states have tried to have articles on the subject published, but they have invariably found it difficult. They have been informed that the matter they wished to print is “indecent, shocking.” Newspapers and even men who have the public welfare sincerely at heart beat about the bush and resort to all kinds of euphemistic phrases to describe a thing which lies at the root of many terrible evils in the world.\n\nTRUE AND FALSE MODESTY\nNow, I maintain that nothing is indecent which helps to educate the people and arouse an intelligent interest and cooperation in a matter of public welfare. The truth, though unpleasant, is always more desirable than silence regarding an enemy that daily destroys the sight, the hearing, the minds, the morals of men. We may dodge the foe in print: but we have to meet it face to face in our streets and public institutions in the form of sightless eyes, stopped-up ears, crooked limbs, and mindless bodies. Let us put away false modesty and silly prejudices and try to understand the enemy we are fighting. Let us learn all we can about its nature, its forces, and its strongholds. In no other way can we set on foot an intelligent, effective campaign of extermination. I shall, therefore, call a spade a spade in my discussion of ophthalmia neonatorum, the scientific name for the cause of blindness of the new-born. If people are shocked, it will do them no harm. The shock may awaken them to a sense of their responsibility, “a consummation devoutly to be wished.” Not until they do realize their individual and collective responsibility to the unborn can we hope to see the beginning of a fairer race. Not until the world is filled with the light of knowledge shall there be healing for the nations. It is unscientific, unreasonable, to shut our eyes and ears to the facts of life because they happen to be painful or even revolting. The imperative need of our time is knowledge founded on stern truthfulness. We must all emancipate ourselves. from the shackles of authority. We must look at life for ourselves, look at it honestly, fearlessly, compassionately. Only when we so look at life shall we take the first step towards our salvation. Not by hiding the ignorance, the selfishness, the unholy passions, the inhumanity of man to man, can we bring about our social deliverance. What knowledge steals from us is not modesty, but a convention.\n\nTHE CAUSE OF THE DISEASE\nOphthalmia neonatorum is a venereal infection. Of the one hundred thousand blind people in this country at least twenty-five per cent have lost their sight through this infection. We now know that this “folly of youth” (Miss Keller refers to gonorrheal infection) puts out the eyes of innocent babies. Not only is the infected father the cause of disaster to his child, he also in countless cases makes his wife a lifelong invalid. Physicians say that eighty per cent of the operations performed on the maternal organs are traceable to the same cause. The cruelest link in the chain of consequences is the innocent agency of the mother in the destruction of her baby’s beautiful eyes and the unmerited suffering entailed upon her. It is a pity when things that bring such terrible consequences to the children of men may not be discussed in the public prints for fear of offending somebody’s modesty. We shudder at the mere mention of the dread disease, but we keep on building hospitals and asylums for the blind, the deaf, the feeble-minded, and when we look upon these monuments to our shame, our sensibilities are not shocked. Publicity, education, knowledge, will do much to lessen the evils resulting from venereal infection. Most men do not sin wantonly. I firmly believe that the majority of mankind wish to be decent towards their offspring, that they earnestly desire to bring into the world physically and mentally sound children. They must know the truth if their heart’s desire is to be fulfilled.\n\nHOW SIGHT MAY BE SAVED\nOphthalmia neonatorum appears in the baby’s eyes at birth, causing a particular redness that cannot be mistaken. From that moment its cruel work goes forward swiftly, and by the third day the child’s precious sight is gone forever. It has been known for more than twenty-five years that this disease was preventable. But this knowledge has been kept almost exclusively as the possession of physicians. No attempt has been made until recently to educate the people about its cause and the remedy to be applied. Physicians themselves have been criminally careless in this matter. However, they are waking up to their responsibility. The childloving people of the world have sounded the alarm, and a determined fight is beginning to put an end to this appalling waste of human faculties. A number of states and societies are directing their attention to the prevention of infantile blindness. They are distributing literature on the subject and supplying the silver nitrate solution free, with printed directions how to use it. Massachusetts is making a statewide effort to stamp out ophthalmia neonatorum. The Sage Foundation is also doing splendid work, collecting valuable information about this disease, getting sanitary laws passed and seeing that the laws which already exist are enforced. There should be a law in every state heavily fining or imprisoning physicians who cannot show that they have used silver nitrate in the eyes of every baby born under their care, and that they have reported all cases of ophthalmia neonatorum. This law has been in force in France for years. Perhaps I ought to say a word about the remedy itself. It consists of a silver nitrate solution. It is simple, easy of application and effective in practically all cases where it is used promptly after the birth of the child. The frightful progress of the disease makes it very important to have the remedy immediately accessible. Delay means partial or total blindness. In Massachusetts carefully sealed packages containing the silver nitrate solution, a dropper and a leaflet with directions are placed free in every drug store in every city and town of the commonwealth. It is high time that every state in the Union followed the example of Massachusetts. It is also imperative that the press of the country should break the conspiracy of silence on a subject which concerns the public welfare.\n\nEDUCATION IS NECESSARY\nThe question I have been discussing has many ramifications. It leads us quickly into complicated economic problems. It brings us face to face with many phases of social maladjustment. Workers for social improvement understand that most of the afflictions which we have for generations been taught to believe were a visitation of Providence result from wrong economic conditions. Our minds are still fettered by false teaching, false ideals, false standards. The only way to change all this is to educate the people. They must be taught about the things that vitally concern them. Let us banish from our schools dead histories, dead languages, dead philosophies. Let us learn about the things that are near to us—that concern our daily life; the processes of industry, the laws of social development, the growth of great cities, the causes of slums and social disease, sex hygiene and other truths in which lies the\n\n[handwritten: incomplete]",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      }
    ]
  },
  "together": {
    "id": "together",
    "number": 2,
    "label": "Together",
    "descriptionMode": DESCRIPTION_MODE_SECTIONS,
    "quote": "“Alone we can do so little; together we can do so much.” - Helen Keller, 1920",
    "description": "Relationships were an essential part of Helen Keller’s growth, education, and her accomplishments. Through friends across both society and the globe, known and unknown, Helen knew that collaboration was the key to success.",
    "iconAlt": "Helen's gold door knocker is layered over handwritten notecards.",
    "artifacts": [
      {
        "id": "2A1",
        "title": "Letter from Eugene Debs, 1919",
        "displayTitle": "Letter from Eugene Debs",
        "year": "1919",
        "description": "Eugene Debs, a former socialist presidential candidate, trade unionist, and Southern Indiana native, wrote this letter to Helen while serving a 10-year prison sentence for sedition after he delivered a 1918 speech urging resistance to the military draft. Debs would go on to run for president in 1920 while still imprisoned.",
        "type": "document",
        "alt": "A handwritten letter to Helen from socialist Eugene Debs, shown here on its first page.",
        "images": [
          {
            "src": "2A1Debs1.png",
            "alt": "Page 1 of letter from Eugene Debs to Helen Keller, 1919",
            "guidedDescription": "The first of two pages of a handwritten letter to Helen from socialist Eugene Debs. West Virginia Penitentiary letterhead has blanks for sender and recipient above a floral design. Blue-lined paper is filled with cursive. Creases and a faint upside-down watermark show."
          },
          {
            "src": "2A1Debs2.png",
            "alt": "Page 2 of letter from Eugene Debs to Helen Keller, 1919",
            "guidedDescription": "The second of two pages of a handwritten letter to Helen from socialist Eugene Debs. Small print at the top gives the prison warden's four paragraphs of correspondence instructions. Unlike page one, this page is unlined. Inked cursive fills it. Creases and a faint upside-down watermark show."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "Give full address of your letter here\nName Helen Keller\nStreet number 25 Seminole Avenue\nTown Forest Hills\nCounty Long Island. State New York\n\nPlace full name and serial number here\nName Eugene V. Debs\nSerial number 2253\nCells in\n\n818 JEFFERSON Avenue\nMOUNDSVILLE, West Virginia April 30th 1919\n\nMy dear Helen Keller:\n\nYou will, I am sure, excuse my seeming [indecipherable].  My brother, in my absence, acknowledged the [swift] of your beautiful, charming and inspiring letter, now I meant to write and thank you soon after it came into my hands, but I was kept so busy and in such a state of uncertainty on account of daily expectation of arrest and incarceration that I was unable to give attention to my correspondence.  Permit me, my dear comrade, to say to you at this late day that no letter I ever received touched me more deeply or afforded me greater satisfaction.  Coming from you this fine, appreciation, characteristic expression compensates in full for a lifetime of service.\nYou have always been [indecipherable], since first I knew of your heroic struggle and your [handwritten] insurmountable attainment, the most wonderful of women, and your bold, fearless, uncompromising spousal of the cause of the workers won at once my admiration and respect and endeared you to me beyond words.   You have used all the power you have [soon and] all the means you have achieved to [indecipherable] upon the workers, aye, \"the [trail] of three,\" that they might win the world for the freedom and happiness of all.  You have never faltered, never doubted, and never compromised.  You are the incarnation of the revolutionary spirit now [indecipherable], and humanizing the world.  You continue all that is fine and brave, sweet and strong, enabling an inspiring in your contribution to the cause, and I thank you with all my heart, and with love and all your wishes to you, I am always\nYours faithfully\nEugene V. Debs\n\nINSTRUCTIONS TO RELATIVES AND FRIENDS\nMAKE All Letters Brief.  Write Plainly In The English Language only. Confine letters to family or business affairs.  In addressing letters and newspapers, write the prisoner’s full name and serial number plainly on the envelope or wrapper to insure the prisoner receiving them. All incoming and outgoing letters must be first read by an officer before delivery. All papers and packages are closely inspected before delivery. Prisoners will be permitted to see their friends twenty minutes twice each month.\nPrisoners are furnished with coarse shoes, warm woolen outer clothing, comfortable underwear and plenty of plain wholesome food: the sending of food is undesired and may be withheld. Plain shoes, while not necessary are unobjectionable. Daily and weekly papers, magazines and books will be delivered.\nVisitors are admitted to the institution on the payment of a fee of 26 cents on week-days at 10:30 a.m. 1:20 and 4:30 p.m. and conducted through the institution.\nPrisoners will be permitted to write once each week; and special permits will be granted by the Warden only to write other letters in regard to pardon or parole cases or any other urgent business.\nAll express packages sent to inmates must be sent prepaid. No drugs of any kind will be permitted except on the order of Prison Physician.\n\nJ.Z. Terrell Warden",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "2A2",
        "title": "Letter to General MacArthur, 1949",
        "displayTitle": "Letter to General MacArthur",
        "year": "1949",
        "description": "Although Helen and General MacArthur, a top U.S. general during WWII, could not have been more dissimilar in their career paths or politics, the two worked closely and successfully during her post-war trip to Occupied Japan. In this warm and cordial letter, Helen thanks him for bringing international attention to the needs of blind and disabled people in the post-WWII-ravaged nation.",
        "type": "document",
        "alt": "A yellowed sheet of paper shows the first page of a typed letter from Helen to General MacArthur.",
        "images": [
          {
            "src": "2A2MacA1.png",
            "alt": "Page 1 of Helen Keller’s letter to General MacArthur, 1949",
            "guidedDescription": "A yellowed sheet shows page one of two of Helen's typed letter to General MacArthur. Two vertical creases and one horizontal crease cross the center. Minor corrections in pen and pencil appear throughout. Holes in the top left corner show where pages were bound."
          },
          {
            "src": "2A2MacA2.png",
            "alt": "Page 2 of Helen Keller’s letter to General MacArthur, 1949",
            "guidedDescription": "A yellowed sheet shows page two of two of Helen's typed letter to General MacArthur. Two vertical creases and one horizontal crease cross the center. Minor corrections in pen and pencil appear throughout. Holes in the top right corner show where pages were bound."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Handwritten note: H.K. Friends and Celebrities MacArthur, Douglas General.]\n\nGeneral MacArthur, [handwritten note above: Douglas]\n\nTokyo, Japan.\n\nDear General MacArthur, This is a most welcome opportunity for me to write to you. With delight and gratification I have received information of your cordial interest in the travelling exhibit of Japanese paintings that is to be brought to the United States, and I want to thank you especially for your graciousness in encouraging a renewal of artistic sympathy between the [strikethrough: Japan] peoples of Nippon and America.\n\nIn a real sense you will benefit both countries. America will be [handwritten note: \"authority] stimulated through the \"aithority of Beauty\" to friendship and understanding of the highly gifted Japanese and their sensibilities which it has been my privilege to witness in two visits to their charming land. Also I hope that Nippon may be drawn into closer cooperation with America for their mutual advantage and welfare.\n\nHow often my thoughts have winged their way to you and Mrs. MacArthur this year! And how my heart throbs with gratitude for smoothing the rough trails under the feet of the blind in Japan and for your continued favorable attitude towards their rehabilitation. Miss Thomson and I are eagerly awaiting Takeo Iwahashi's arrival in this country, about the 9th of December. With the American Foundation and other workers for the blind we will do our best to make his visit a splendid channel of good to the handicapped of Japan and thus pay the deep debt we owe you and the members of your staff.\n\nWith warmest greetings to Mrs. MacArthur and yourself, in which Miss Thomson joins, and wishes for a Christmas rich in the sense of good you have wrought, I am. Sincerely yours.\n\nWestport, Connecticut,\n\nDecember sixth, [strikethrough: 10x] 1949.",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "2A3",
        "title": "Letter from Mark Twain, 1905",
        "displayTitle": "Letter from Mark Twain",
        "year": "1905",
        "description": "Despite a 40-year age difference, Helen Keller and Mark Twain maintained a lengthy friendship based on their love of humor and their shared politics. In this handwritten letter of thanks from Mark Twain on his 70th birthday, he adds a very personal note to Helen on the back, wishing her and Mrs. Macy love before signing off “Always Affectionately” under his real name, Samuel L. Clemens.",
        "type": "document",
        "alt": "A sheet of paper shows the first page of a handwritten letter to Helen from Mark Twain.",
        "images": [
          {
            "src": "2A3Twain1.png",
            "alt": "Front of handwritten letter from Mark Twain to Helen Keller, 1905",
            "guidedDescription": "A sheet of paper shows the first of two pages of a handwritten letter from Mark Twain to Helen. His cursive script fills the page. On this first page, the signature of \"Mark Twain\" is in a darker ink, along with the phrase \"over,\" indicating text on the back."
          },
          {
            "src": "2A3Twain2.png",
            "alt": "Back of handwritten letter from Mark Twain to Helen Keller, 1905",
            "guidedDescription": "A sheet of paper shows the second of two pages of a handwritten letter from Mark Twain to Helen. The second page is written in the darker ink, with the signature of \"S.L. Clemens,\" Twain's real name. This difference in ink may suggest that the message on the front was pre-printed."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "To you, and to all my other known and unknown friends who have lightened the weight of my seventieth birthday with kind words and good wishes I offer my most grateful thanks, and beg leave to sign myself,\n\nYour and Their obliged friend\nMark Twain\n\nOVER\nNew York, December 6, 1905\n\nIt is a lovely letter, Dear Helen and I thank you from my heart for it.\n\nRemain an optimist just as long as you can, dear!   I would not abridge the term by a single day. But as for me - ah, That is different!\n\nDo please give my love to her and Mrs. Macy.\n\nAlways affectionately\n\nS.L. Clemens",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "2A4",
        "title": "Student Christmas Letters, 1934",
        "displayTitle": "Student Christmas Letters",
        "year": "1934",
        "description": "After reading about the talking book program at the American Foundation for the Blind, third- and fourth-grade students from Wrangell, Alaska wrote Helen about publishing a small pamphlet of their own writing.  They sold each copy for 2 cents and donated the money to the American Foundation for the Blind to show the spirit of giving during the holidays.  Their daily lives were also detailed as only students of that age could.",
        "type": "document",
        "alt": "A letter envelope from students in Wrangell, Alaska. A handwritten postcard is addressed to Helen from third and fourth graders at Wrangell Public Schools.",
        "images": [
          {
            "src": "2A4Student1.png",
            "alt": "Student Christmas letter to Helen Keller, letter 1 of 6",
            "snapPanDisabled": true
          },
          {
            "src": "2A4Student2.png",
            "alt": "Student Christmas letter to Helen Keller, letter 2 of 6"
          },
          {
            "src": "2A4Student7.png",
            "alt": "Student Christmas letter to Helen Keller, letter 3 of 6"
          },
          {
            "src": "2A4Student5.png",
            "alt": "Student Christmas letter to Helen Keller, letter 4 of 6"
          },
          {
            "src": "2A4Student12.png",
            "alt": "Student Christmas letter to Helen Keller, letter 5 of 6"
          },
          {
            "src": "2A4Student3.png",
            "alt": "Student Christmas letter to Helen Keller, letter 6 of 6"
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "Top left, pencil, with \"Endowment Fund\" underlined in red: Endowment Fund, as per Mrs. Thomson [remainder illegible] 2/20/33\nFaint gray pencil below: [Mostly illegible. Appears to be a note summarizing Miss Keller's thank-you letter for a gift.]\n\nStamped, top right: HELEN KELLER\nStamped, right: RECEIVED / February 16 1933 / [partly obscured by the letter text]\n\nWrangell, Alaska\nJanuary 30, 1933\n\nMy dear Miss Keller:\n\nThe enclosed letters – sixteen of them – are from the third and fourth grades of Wrangell Public School. Each one wanted to write you and I wish you could have seen these eager, busy people bending over their desks. With the exception of Olga and Jane, and Henry Willard who is fourteen, the children in these grades are eight and nine years of age.\n\nAt Christmas time there was so much talk among the children about what they wanted and what was given them that it seemed to me they were missing the joy of giving. So the Two Cent Press, a mimeographed sheet of their own writings, was sold to earn the money they are sending you – and sending with the greatest of pleasure.\n\nSincerely yours,\n(Miss) Elizabeth Aitken\n\nOther marks: B2289 (near signature); red 236 and a red checkmark (bottom left); additional pencil notes at bottom left [illegible].\n\nWrangell, Alaska\nMay 16, 1934\n\nDear Miss Keller:\n\nI wish I could talk to you over the radio, I could tell you that I could talk to you, better that way, than any other way. I wish you could see my dog his name is wimpy he will try to chew your clouthes up. He is a [struck-through word, possibly \"fox\"] terrier.\n\nSincerly yours\nRobert Shermer\n\nWrangell Alaska\nMay 16, 1934\n\nDear Miss Keller,\n\nWe like your photograph. We had it framed. I would like to see a talking book. I got a bull dog and he is a foxy little dog. I like him very much, and so would you if you saw him.\n\nSincerely yours,\nBilly Floyd\n\nPencil, top right: H.K. / P.R.-1934 / STOKES, Richard\n\nWrangell, Alaska\nDecember 10, 1934\n\nDear Miss Keller:\n\nI am in the [struck: third] [inserted above: fourth] Grade now. I hope you are well. We like your picture it is hanging on the wall with some great men like George Washington an admiral Byrd. We all ready had one cover of snow on the ground. We never sent you the basket full of flowers but we sent you a basket. I wish you an merry christmas.\n\nSincerly yours\nRichard Stokes\n\nHandwritten, top right: P.R. / Wrangell (Alaska) / Public School\n\nFebruary 24, 1933.\n\nMiss Elizabeth Aitkin\nWrangell, Alaska.\n\nStamp: FOR ARCHIVES\nHandwritten beside it: By [illegible initials/name] 2/29/72\n\nDear Miss Aitkin:\n\nI am enclosing a letter herewith which I wish you would give to the children of your third and fourth grades. It was a fine thing that they did in sending the money which they had earned to Miss Keller to be used in the interest of the blind. It was doubly so, since it represented money that they had actually earned themselves. We, of course, feel that the moving spirit behind the project was undoubtedly the teacher. As you will note in the letter to the children, Miss Keller is sending them an autographed photo.\n\nLet me take this opportunity of thanking you, as well as the children, for this expression of good will and interest toward the blind on the part of you and your school children.\n\nSincerely yours,\n\nEber L. Palmer\nAssistant Director.\n\nE.L.P.: F.M.K.\n\nP. S. We are enclosing herewith the receipt for the money sent.\n\n(Transcribed by a blind secretary.)\n\nEnclosure\n\nFaint stamped box, bottom: RETENTION [...] 6 years / 3 years / 1 year",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_LETTERS,
        "letterSections": [
          {
            "imageIndices": [
              0
            ],
            "guidedDescription": "A quarter sheet of paper shows an envelope of one of 6 student letters to Helen from Wrangell, Alaska. In the upper left corner is the Wrangell Public Schools header. A red ink, 3-cent postage stamp is near the top right corner. Handwritten text under it shows Helen's Forest Hills address, where the letters were sent. Additional, illegible handwritten text is on the right side in black and red ink."
          },
          {
            "imageIndices": [
              1
            ],
            "guidedDescription": "A cream sheet holds a handwritten letter in blue ink, dated January 30, 1933, from Elizabeth Aitken in Wrangell, Alaska, to Miss Keller. A large gray \"Helen Keller\" stamp and a \"Received, February 16, 1933\" stamp sit at right. Pencil and red notes cover the margins."
          },
          {
            "imageIndices": [
              2
            ],
            "guidedDescription": "A cream, blue-lined sheet holds a short letter in blue ink, dated May 16, 1934, from Robert Shermer in Wrangell, Alaska, to Miss Keller. The writer wishes to talk with her by radio and describes his terrier, Wimpy. A crossed-out word interrupts the final line, and a faint brown stain marks the page."
          },
          {
            "imageIndices": [
              3
            ],
            "guidedDescription": "A yellowed, blue-lined sheet holds a short pencil letter in neat cursive, addressed \"Dear Miss Keller\" and dated May 16, 1934, from Wrangell, Alaska. A child writes about a framed photograph, a talking book, and a bulldog. A few small holes dot the top left corner."
          },
          {
            "imageIndices": [
              4
            ],
            "guidedDescription": "A cream, blue-lined sheet holds a letter in dark ink, dated December 10, 1934, from Richard Stokes in Wrangell, Alaska, to Miss Keller. Small pencil notes at top right give his name and the year. One word is crossed out and \"fourth\" is written above it. Small holes dot the top left."
          },
          {
            "imageIndices": [
              5
            ],
            "guidedDescription": "A yellowed typed letter dated February 24, 1933, is addressed to Miss Elizabeth Aitkin of Wrangell, Alaska, and signed by Eber L. Palmer, Assistant Director. Pencil at the top right reads \"Wrangell (Alaska) Public School.\" A gray \"For Archives\" stamp and handwritten initials and date sit beside the greeting."
          }
        ]
      },
      {
        "id": "2A5",
        "title": "Arcan Ridge Door Knocker",
        "displayTitle": "Arcan Ridge Door Knocker",
        "year": "1947",
        "description": "This knocker hung on the door of Helen’s Easton home on Arcan Ridge from 1946 to 1968. What important visitors may have used it over those decades, visiting Helen with important work or exuberant celebrations?",
        "type": "object",
        "alt": "Helen's home door knocker is inscribed with her first and last name.",
        "images": [
          {
            "src": "2A5DoorKnock.png",
            "alt": "Helen's home door knocker is inscribed with her first and last name."
          }
        ],
        "guidedDescription": "A cast brass door knocker shaped like an urn has finials on its top and bottom.  A flat faceplate near the middle of the urn is engraved with \"HELEN KELLER.\"  A swinging, horseshoe-shaped striker hangs from the sides of the faceplate."
      },
      {
        "id": "2A6",
        "title": "Letter Requesting FDR Autograph, 1929",
        "displayTitle": "Letter Requesting FDR Autograph",
        "year": "1929",
        "description": "Having received a typewritten letter from Gov. Franklin D. Roosevelt declining membership in the American Foundation for the Blind, Helen replied on the reverse with a handwritten note requesting his autograph.  The only autograph she had ever asked for, she wanted to make her request before he became the President of the United States. Four years later, he was elected to that position.",
        "type": "document",
        "alt": "A typed letter on State of New York letterhead features a letter to Helen from Franklin Delano Roosevelt.",
        "images": [
          {
            "src": "2A6FDR2.png",
            "alt": "Page 2 of Helen Keller’s letter requesting FDR’s autograph, 1929",
            "guidedDescription": "Franklin Roosevelt's typed letter to Helen is on State of New York letterhead. A gold seal shows an eagle above a shield with a rising sun and ships, flanked by two robed women, over a scroll reading \"Excelsior.\" Blue office details, one edit, and an ink signature complete it."
          },
          {
            "src": "2A6FDR1.png",
            "alt": "Page 1 of Helen Keller’s letter requesting FDR’s autograph, 1929",
            "guidedDescription": "A piece of paper shows Helen's handwritten response to Roosevelt's typed letter. Her handwriting is in pencil and fills the page. Faint lines are visible at the top and bottom third of the page."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "Franklin D. Roosevelt Governor\nSTATE OF NEW YORK EXECUTIVE CHAMBER ALBANY\nFebruary 7, 1929.\nMiss Helen Keller, 93 Seminole Avenue, Forest Hills, New York. My dear Miss Keller: I received your letter of January 1st together with enclosures which I have read with interest and want to extend to you my heartest [sic] good wishes and congratulations.\nAt the same time I will be unable to become a member of the American Foundation for the Blind [Handwritten annotation: ,much to my regret.]\nWith kindest personal regards, I am\nVery sincerely yours, [handwritten signature: Franklin D. Roosevelt]\n \n[handwritten] Please, dear Mr. Roosevelt sign your Full name. Some thing tells me that you are going to be the next President of the \"Land of the Free and the home of the brave\", and this seems a good time to get your autograph. It may interest you to know I have never asked for any ones autograph before, With all good wishes\n\nI am, Cordially yours\nHelen Keller",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      }
    ]
  },
  "adventure": {
    "id": "adventure",
    "number": 3,
    "label": "Adventure",
    "descriptionMode": DESCRIPTION_MODE_SECTIONS,
    "quote": "“Life is either a daring adventure or nothing.” - Helen Keller, 1940",
    "description": "Whether exploring one of the 39 different countries she traveled to, or piloting an airplane over Europe, Helen’s lust for adventure was an inspiration to the world. Each of her travels left a lasting impression on the people and nations that she visited.",
    "iconAlt": "A black and white image of Helen with a Bantu chief is layered with a Japanese luncheon set and travel documents.",
    "artifacts": [
      {
        "id": "3A1",
        "title": "Helen Keller Takes a Ride in an Airplane",
        "displayTitle": "Helen Keller Takes a Ride in an Airplane",
        "year": "1919",
        "description": "The 1919 silent biographical film “Deliverance” tells the story of Helen's life in three acts: Childhood, Maidenhood, and Womanhood. Helen plays herself in this movie. In this clip, she rides in the open cockpit of a biplane.",
        "type": "video",
        "videoSrc": "3A1Biplane.mp4",
        "posterSrc": "3A1Biplane_frame.png",
        "alt": "A black-and-white image shows Helen preparing to ride in an airplane.",
        "images": [],
        "transcriptTitle": "Transcript",
        "transcriptText": "From Female narrator: It showed her first airplane ride. A daring feat at that time.\nMale audio description: In old, black-and-white footage, elegantly-dressed women help tidy Helen’s leather coat.\n[engine rumbles]\nMale audio description: She also wears a tight leather helmet on her head. An airplane drives across a field and takes off into the air. On the ground, Helen’s friends watch excitedly as the plane flies high in the sky.\n[uplifting orchestral music]\nMale audio description: Helen rides in the front and a pilot steers in the back of the two-seater aircraft. Wind flies over their heads in the open, roofless plane. The airplane safely lands on the flat, grassy ground. Dozens of people rush to the parked plane and assist Helen out of the sunken seat. Helen smiles broadly and hugs her teacher Anne Sullivan Macy."
      },
      {
        "id": "3A2",
        "title": "Japanese Luncheon Set, 1948",
        "displayTitle": "Japanese Luncheon Set",
        "year": "1948",
        "description": "Kazuo Honma, a blind Japanese activist, educator, and founder of the National Library for the Blind in Japan, gifted Helen a black lacquer New Year's luncheon set in 1948 as a token of his admiration for her. Two photos show the luncheon set in detail.",
        "type": "object",
        "alt": "A Japanese luncheon set is unassembled to show all of its contents.",
        "images": [
          {
            "src": "3A2Lunch1.png",
            "alt": "A Japanese luncheon set is unassembled to show all of its contents."
          },
          {
            "src": "3A2Lunch2.png",
            "alt": "Japanese luncheon set assembled in its carrying stand",
            "guidedDescription": "The luncheon set fits neatly back together, with all items inside the carrying stand with the brass top."
          }
        ],
        "guidedDescription": "All items in the luncheon set feature gold decorations showing plants, symbols, and designs. Golden and carved abalone inlays show birds facing each other in a triangular pattern. An outer carrying stand with brass top handle holds six drawers, each with a red interior. One medium sized tray, five smaller trays, a removable bottle holder, and a pair of pewter cylinder bottles all fit into the carrying stand."
      },
      {
        "id": "3A3",
        "title": "Photograph with Bantu Chief, 1951",
        "displayTitle": "Photograph with Bantu Chief",
        "year": "1951",
        "description": "Helen traveled to East London, South Africa to open the Duncan Village Community Center for Bantu People on April 11, 1951. Like other segregated locations in South African cities, Duncan Village demonstrated the extreme inequality between black and white residents under the country’s system of apartheid.",
        "type": "photograph",
        "alt": "A black-and-white image shows Helen with a Bantu chief and his wife.",
        "images": [
          {
            "src": "3A3Bantu1.png",
            "alt": "A black-and-white image shows Helen with a Bantu chief and his wife."
          },
          {
            "src": "3A3Bantu2.png",
            "alt": "Back of photograph of Helen Keller with a Bantu chief",
            "guidedDescription": "Pencil on the back of the photograph repeats the caption about Helen opening the Duncan Village Community Center, and asks that it be returned to the American Foundation. Red ink reads \"14 1/2 picas\" with an arrow marking the width. A rectangular stamp reads \"Wyndon Photos.\""
          }
        ],
        "guidedDescription": "In this black-and-white photograph, Helen and Polly Thomson pose with a Bantu chief and his wife. The chief, draped in beaded necklaces and belts, holds a spear as Helen feels its tip. His wife wears a large cloth hat and painted facial dots. Helen and Polly wear striped dresses."
      },
      {
        "id": "3A4",
        "title": "Global Travel Schedule, 1948-49",
        "displayTitle": "Global Travel Schedule",
        "year": "1948–49",
        "description": "This travel itinerary details Helen’s travels from March of 1948 to April 1949, when she embarked on a global journey including visits to Australia, Korea, China, Thailand, India, Syria, and more, to meet with officials about the welfare of blind people in their respective countries.",
        "type": "document",
        "alt": "A typed schedule outlines Helen's travels from 1948-1949.",
        "images": [
          {
            "src": "3A4_TentativeShedKeller.png",
            "alt": "A typed schedule outlines Helen's travels from 1948-1949."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "TENTATIVE ITINERARY OF HELEN KELLER'S VISIT\nTO COUNTRIES OF THE ORIENT AND NEAR EAST (March ’48 to April '49)\nMarch 21 to August 15 - Australia and New Zealand\nLeave San Francisco by plane March 25 for Sydney, Australia. Guest of Honorable Mr. Justice Maxwell, President of the Royal Industrial Institute for the Blind, Sydney, Australia.\nAugust 15 Enroute to Japan via Manila or Singapore and Bangkok.\nSeptember 1 to October 20 - Japan [underlined], where eleven cities will be visited - Tokyo, Sendai, Sapporo, Kanazawa, Nagoya, Osaka, Kyoto, Hiroshima, Fukuoka, Nagasaki, and Takamatsu. Arrangements are in the hands of a nation-wide committee. (Takeo Iwahashi of the Lighthouse in Osaka, is chief correspondent).\nOctober 20 to November 5 - Korea where at least 4 cities in South Korea will be visited. Arrangements in the hands of a National Committee, consisting of Koreans, missionaries, government and military representatives. (R.C. Coen and George Paik, correspondents).\nNovember to December 25 - China [underlined]\nTentative list of cities to be visited - Peiping, Tsinan, Tientsin, Hankow, Nanking, Shanghai, Soochow, Hangchow, Foochow, Amoy, Canton and Hongkong. National Committee now being set up in consultation with government representatives, National Agencies for the blind and the National Christian Council.\nDecember 28 to January 4 - Brief stop-overs at Bangkok, Siam and Rangoon, Burma, enroute to India, (Singapore also a possibility of an invitation from the Lord Bishop of Singapore.)\nJanuary 4 to February 10 - India [underlined] and Pakistan [underlined]\nTentative list of cities to be visited: Calcutta, Madras, Bangalore, Vellore, Travancore, Nagpur, New Delhi, Bombay, Lahore and Karachi. (Final itinerary to be agreed upon after consultation with Government representatives, the India Association for the Welfare of the Blind, the National Christian Council of India, the All-India Council of Women and other groups.\nFebruary 10 to March 25-Egypt., Iran, Iraq, Syria, Lebanon and Palestine.\nItinerary to be worked out in consultation with Regional Councils, Government authorities, individuals, and local city groups.\nMarch 25 to 30 - Return to U.S.A. [underlined], - stop-over at Istanbul, Turkey, if returning by plane.\n\nGENERAL STATEMENT [underlined]\nThe tour, after leaving Japan, will be under the auspices of the JOHN MILTON SOCIETY for the Blind, of which Miss Helen Keller has been the honored President since 1928. This non-sectarian and inter-denominational Society is the officially appointed agency of more than 40 Protestant denominations in the United States and Canada. It exists primarily to provide Christian literature in Braille to the blind of the U.S., Canada and throughout the world.\nIts monthly religious magazines for adults and children, together with its other occasional publications, reach more than 10,000 Braille readers residing in every state and in 26 foreign countries. Among these readers are more than 600 blind ministers and Sunday School teachers. Leave of absence for this world tour has been granted to Miss Keller by the American Foundation for the Blind of which she is Counsellor. It is hoped that a substantial part of the cost of this tour will be provided by special gifts from interested friends.\nThe program to be set up in each city will include press interviews, public meetings, visits to schools and hospitals, official receptions and informal conferences with workers among the blind.\nThere will be at least 4 in the party - Miss Helen Keller, Miss Polly Thomson, her companion and secretary, Dr. Milton T. Stauffer, General Secretary of the John Milton Society for the Blind, Mrs. Stauffer and in addition, if possible, an experienced educator of the blind in this country whose knowledge and counsel on educational matters would be of special value in Worker's Conferences.",
        "guidedDescription": "Two sheets of paper show staple holes in the top left corner. The text has been typed in black ink. There is light fading of the typing towards the top of each page, which may indicate that this was a printed copy of the original typed agenda."
      },
      {
        "id": "3A5",
        "title": "Photograph of Helen Dancing with Italian Veteran, 1946",
        "displayTitle": "Dancing with Italian Veteran",
        "year": "1946",
        "description": "In 1946, Helen took a trip to postwar Europe alongside her companion Polly Thomson to advocate for wounded veterans and people with vision loss.  In this image, Helen dances with an Italian veteran at the Roman Institute for War Blind.",
        "type": "photograph",
        "alt": "A black-and-white photograph shows Helen dancing with a blind man.",
        "images": [
          {
            "src": "3A5ItalyVet1.png",
            "alt": "A black-and-white photograph shows Helen dancing with a blind man."
          },
          {
            "src": "3A5ItalyVet2.png",
            "alt": "Back of photograph of Helen Keller dancing with an Italian veteran",
            "guidedDescription": "On the back of the photograph, a purple-ink stamp from an Italian ministry appears in Italian. Below it, black type gives the photo's date, location, and a brief description, also in Italian. Overlaid typed text states that the photograph belongs to the Helen Keller Archives at the American Foundation for the Blind."
          }
        ],
        "guidedDescription": "In this black-and-white photo, a veteran in his wartime San Marco Marine jumper holds Helen's right hand in his left while Polly Thomson spells into it. His chest patch shows a winged lion with a sword on an open book. Smiling, he shows missing teeth. Civilians watch behind them."
      },
      {
        "id": "3A6",
        "title": "Photograph with Golda Meir, 1952",
        "displayTitle": "Photograph with Golda Meir",
        "year": "1952",
        "description": "In the spring of 1952, a 72-year-old Helen traveled to Israel to meet with several Israeli leaders, including future Prime Minister of Israel, Golda Meir. Helen spent a total of two weeks in Israel on an international advocacy tour for people who are blind or deaf.",
        "type": "photograph",
        "alt": "A black-and-white photograph shows Helen sitting with Israeli Prime Minister Golda Meir and others around a table.",
        "images": [
          {
            "src": "3A6Israel1.png",
            "alt": "A black-and-white photograph shows Helen sitting with Israeli Prime Minister Golda Meir and others around a table."
          },
          {
            "src": "3A6Israel2.png",
            "alt": "Back of photograph of Helen Keller with Golda Meir",
            "guidedDescription": "Handwritten text at the top of the back of the photograph names Helen Keller, Polly Thomson, Golda Myerson, and Mrs. Zypora Sharett, 1952. Below it, a purple stamp in Hebrew and English reads \"State of Israel, Government Press Division.\""
          }
        ],
        "guidedDescription": "In this black-and-white photograph, Helen sits on a sofa beside Polly Thomson, placing her thumb on Polly's throat and fingers on her lips to \"listen.\" Across a round coffee table sit Golda Meir and Zipporah Sharett, wife of Israel's second Prime Minister. Helen and Polly wear light dresses and hats."
      },
      {
        "id": "3A7",
        "title": "Syria Travel Itinerary, 1952",
        "displayTitle": "Syria Travel Itinerary",
        "year": "1952",
        "description": "This travel itinerary details Helen travels to the Middle East in 1952, during which she spent 5 days in Syria to raise awareness for people who are blind or deaf and visit local communities.",
        "type": "document",
        "alt": "A typed itinerary with handwriting in blue and red ink outlines Helen's travel to Syria.",
        "images": [
          {
            "src": "3A7Syria1.png",
            "alt": "A typed itinerary with handwriting in blue and red ink outlines Helen's travel to Syria."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Handwritten note in blue ink: Pages 1 to 6 - Egypt Pages 6 to 8 Lebanon Page 9 - Syria Pages 10 to 13 - Jordan (a grouping brace) all each country]\n-9-\nHelen Keller's Visit to Syria [circled in red ink] (Damascus) from May 5, evening to May 9, morning. 1952\nTuesday, May 6.\n11:00 a.m. Press conference at the Hotel with 19 journalists from Damascus, Amman and Jerusalem.\n11.45 \" Visit to Mr. Grand Parr, Public Affair Officer and to Mr. Donald Snock, Cultural Officer of the American Legation, Damascus.\n3:30 p.m. Drive through the old city, shopping.\n5.00 \" Visit to Mr. Cavendish Cannon, Minister of U.S.A.\nWednesday May 7.\nRest in the morning.\n3:15 p.m. Mrs. Abed, mother and daughter, pay a visit to Helen and Polly in the Hotel.\n4.00 \" Talk at the hall of the \"Milk Distribution Center\" of Mrs. Abed, where about 150 persons are present, mostly women. Helen asks these women:\n1. to create a women's organisation for the Welfare of the Blind.\n2. to take upon their hearts the necessity for opening a school and workshops for the Blind.\n5:30 p.m. Reception at the U.S. - Residence. Farewell to MInister and Mrs. C.Cannon.\nThursday, May 8.\n8:30 a.m. Visit to the Museum. (Director: Mr. Selim bey Adel Abdul Hak)\n9.30 \" Visit to the Palais Azem, old arabic architecture.\n10.30 \" Visit to the House of General Selo: Helen writes down her name in the \"Golden Book of Syria\".\n11.30 \" Dr. and Mrs. C Zurayk, President of the Syrian University, Damascus, together with Dr. Djemil Saliba, Dean of the Medical Faculty and Dr. A. Chahina, Dean of the Educational Faculty, pay a visit to Helen and Polly. Dr. Saliba translated into Arabic sections out of \"The Story of my Life\". It was printed by the Ministry of Education in \"EL MOOLLEM EL ARABY\", He had sent to Helen a specimen of all the books that have as content her life's story.\n6:00 p.m. Lecture at the French-Arabic Lycee. [underlined] (Mr. Marc Manger, Director) About 600 persons were present and almost just as many stood outside, as they couldn't find place in the hall! Introduction by Dr. Taher Muradi, M.D. cancer specialist.",
        "guidedDescription": "A typed travel itinerary lists times in the left column and underlined dates on the right. Top handwriting notes these days fell between trips to Egypt, Lebanon, and Jordan. A blue-ink table of contents is at top left. Syria is circled in red there and in the title."
      }
    ]
  },
  "work": {
    "id": "work",
    "number": 4,
    "label": "Work",
    "descriptionMode": DESCRIPTION_MODE_SECTIONS,
    "quote": "“If we do not like our work, and do not try to get happiness out of it, we are a menace to our profession as well as to ourselves.” - Helen Keller, 1930",
    "description": "No less a fixture in Vaudeville than in the Cambridge School for Young Ladies, Helen had an extremely diverse life in both education and employment. Her work in literary circles, Radcliffe College, and even in Hollywood no doubt contributed to her incredible ability to prevail in the most challenging of endeavors.",
    "iconAlt": "A Corona typewriter is layered over documents and a black and white photo of Helen with Charlie Chaplin.",
    "artifacts": [
      {
        "id": "4A1",
        "title": "Corona Portable Typewriter",
        "displayTitle": "Corona Portable Typewriter",
        "year": "1938",
        "description": "Helen took her Corona travel typewriter everywhere with her. People would ask her to type out quotations and sign her name for them. What adventures might Helen have taken this on, and what thoughts might have she communicated with the world through its keys?",
        "type": "object",
        "alt": "Helen's shiny black Corona travel typewriter.",
        "images": [
          {
            "src": "4A1Typewriter1.png",
            "alt": "A photograph shows Helen's shiny black Corona travel typewriter.",
            "snapPanDisabled": true
          },
          {
            "src": "4A1Typewriter2.png",
            "alt": "Close-up of Helen Keller’s Corona portable typewriter keyboard",
            "guidedDescription": "A close-up view of the traveling typewriter keyboard. A worn gold \"CORONA\" label marks the front. A QWERTY keyboard, margin and tab sets on the back, and a label inside the lid complete it.",
            "snapPanDisabled": true
          }
        ],
        "guidedDescription": "A gloss black Corona Silent portable typewriter with a streamlined body and nickel-plated hardware, including two spring latches on the front. A gold \"CORONA\" label marks the front. A QWERTY keyboard, margin and tab sets on the back, and a label inside the lid complete it."
      },
      {
        "id": "4A2",
        "title": "Evaluating a Braille Typewriter, 1954",
        "displayTitle": "Evaluating a Braille Typewriter",
        "year": "1954",
        "description": "In this photograph, Helen evaluates an electro braillewriter while working at American Foundation for the Blind. In the photo with her are AFB Director Robert Barnett, Marta Sobieski, Peter Salmon from the Industrial Home for the Blind, Polly Thomson and Gregor Ziemer. A painting of Helen by Albert H. Munsell hangs in the background.",
        "type": "photograph",
        "alt": "A black-and-white photograph shows a crowd of people around Helen while she uses an electro braillewriter.",
        "images": [
          {
            "src": "4A2AFB1.png",
            "alt": "A black-and-white photograph shows a crowd of people around Helen while she uses an electro braillewriter."
          },
          {
            "src": "4A2AFB2.png",
            "alt": "Back of photograph of Helen Keller evaluating a braille typewriter, 1954",
            "guidedDescription": "The off-white back of the photograph bears a typed notice, with \"Original\" underlined in blue, placing the original in the Helen Keller Archives. Faint pencil notes list the people pictured, an Electro Braille demonstration, and 1954. A separate white caption strip below has a handwritten date correction."
          }
        ],
        "guidedDescription": "A black-and-white photograph shows Helen seated at a large table, touching a small metallic box with electrical cords. Polly sits at her side, a woman presses a button on a keyboard-like device, and four formally dressed men look on. An oil painting of young Helen hangs behind."
      },
      {
        "id": "4A3",
        "title": "Helen’s Vaudeville Script",
        "displayTitle": "Helen’s Vaudeville Script",
        "year": "1920–1924",
        "description": "Between her work as an author and employment at the American Foundation for the Blind, Helen and her companions worked the Vaudeville circuit. While it wasn't steady work, Helen enjoyed it. This script is from a show she performed with her lifelong instructor and friend, Anne Sullivan.",
        "type": "document",
        "alt": "A yellowed, torn sheet of paper shows the first page of Helen's typed vaudeville script.",
        "images": [
          {
            "src": "4A3Vaudeville1.png",
            "alt": "Page 1 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A typed vaudeville script for a sketch featuring Helen and her teacher  Anne Sullivan is printed on yellow paper. Handwritten notes mark the pages, which show folds, tears, and tape repairs."
          },
          {
            "src": "4A3Vaudeville2.png",
            "alt": "Page 2 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A yellowed sheet shows page two of six of a typed vaudeville script. The page number 2 is centered at top. The bottom right corner is torn away, and the edges are worn. Handwritten insertions and a red underline mark the text."
          },
          {
            "src": "4A3Vaudeville3.png",
            "alt": "Page 3 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A yellowed sheet shows page three of six of a typed vaudeville script. The page number 3 sits at top center beneath a large brown stain. Edges are frayed and torn. Pencil marks include a circled phrase, a long curved line, and a checkmark."
          },
          {
            "src": "4A3Vaudeville4.png",
            "alt": "Page 4 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A yellowed sheet shows page four of six of a typed vaudeville script. The page number 4 sits beside a wide strip of brown tape across the top. The left edge is torn and worn. Small handwritten insertions appear in the text."
          },
          {
            "src": "4A3Vaudeville5.png",
            "alt": "Page 5 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A yellowed sheet shows page five of six of a typed vaudeville script. The page number 5 sits beneath a brown stain at top. Handwritten \"What I have to say\" appears above the first speech, which is heavily struck through and overtyped. Blank space fills the lower page."
          },
          {
            "src": "4A3Vaudeville6.png",
            "alt": "Page 6 of Helen Keller’s Vaudeville script",
            "guidedDescription": "A yellowed sheet, shown sideways, is the back of page five of the typed vaudeville script. Faint, mirrored type shows through. Pencil in the center reads \"Personal matter. Helen Keller.\" Brown tape covers the right edge, a central crease, and the bottom."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "Curtain rises on drawingroom set. Orchestra [handwritten note in top right corner: SCRIPT]\nEnter G. A. Lewis.\nLEWIS.\nLadies and Gentlemen: There is no [typed correction: xxxx] more beautiful love story in history or romance than the devotion and loyalty to Helen Keller of her Teacher - that noble woman who has been her constant companion since Helen Keller was seven years old. I have the honor to introduce Helen Keller's Teacher, Mrs. Anne Sullivan Macy.\nMRS MACY:\nAll the world knows and loves Helen Keller, the girl with the unconquerable spirit. She has fought her way uncompaining against the greatest obstacles that ever confronted a human being.\nHelen was born a perfectly normal child but at the age of nineteen months an illness left her deaf dumb and blind. When she was nearly seven I came into her life. I had been blind myself until I was eighteen when an operation partially restored my sight. I resolved that Helen too should share the beauty and glory of the world that had been opened to me. Hand in hand Helen and I went out into the world to fight our way. Through years of Helen's childhood and girlhood we studied and worked together [handwritten: ,] until at the age of twenty she entered Radcliffe College. She was the [strikethrough: first, handwritten above: only] deaf and blind person in the world's history to go to college. She wrote her examinations on her typewriter. At the lectures I saw beside her and spelled into her hand [strikethrough: what was said, handwritten above: \"word by word what the professor said.\"] Most books were read to her in the same way. At the end of four years she graduated with honors, receiving her degree of Bachelor of Arts from Radcliffe College and Harvard University.\nNot only has Helen mastered the English language, which is more [strikethrough: than] than the majority of us have done, but she can speak and read and write French, German and Italian, and she can also read Latin and Greek. [Strikethrough: Today she is an acomplished woman.] Her writings have been translated into many languages, including Russian and Japanese.\nMark Twain, her life-long friend, has said: \"The two greatest characters in the NIneteen Century are Napoleon and Helen Keller. Napoleon tried to conquer the world by physical force and failed. Helen tried to conquer the world by the power of mind - and succeeded.\"\nWhittier and Oliver Wendell Holmes were her friends. Caruso has poured his golden notes into her hand. Godowsky has played to her by the hour. Maeterlinck, the poet, has called her \"The Living Blue-bird.\"\nThrough every medium possible Helen has tried to bring to the world, and especially to those who dwell in darkness, her message of hope and inspiration. Through the books she [typed correction] has written, through lectures, [handwritten note: through moving pictures,] and now from the stage, she is seeking to tell the wonder story of her life. Today she is the Star of Happiness to all struggling humanity.\n(Piano with orchestra)\nHelen can feel the music not only with her fingertips but with her whole body.\n(Enter Helen. Goes to the piano.)\nHELEN. It is very beautiful!\n(Mrs. Macy takes Helen's hand and leads her down.)\nMRS. MACY. Can you tell when the audience applauds?\nHELEN. Oh, yes. I hear it with my feet.\n \nMRS. MACY. When people first meet Helen, they almost always ask me: How did you begin to teach her? When I went to Helen her only means of communication were a few primitive motions or signs. A nod of the head meant Yes. A shake ofthe hand, No. When she was hungry she pointed to her mouth. If she wanted bread and butter she made the motions of cutting the bread and spreading the butter. If she wanted ice-cream, she imitated the motion of turning the freezer. If she smacked her lips everybody knew she wanted candy.\nThe first word I taught Helen to spell on her hand was \"doll.\" I gave her a pretty new doll. When she had felt it, undressed and dressed it, I took her hand and made the letters, D O L L. She looked puzzled and felt my hand curiously. I repeated the letters several times, pointing to the doll and nodding my head. Then I helped her to form the letters with her own fingers. After two or three attempts she spelled the word, pointed to the doll and nodded her head, just as I had done.\nHelen learned the name of a number of objects, in this way, from imitation, without understanding that every object, every action has a name. One day I trying to make her understand the difference between a cup and the liquid it contained.\nAll my efforts had failed. Finally it occurred to me to lead her to the pump. I made her hold her cup while I pumped. As the water gushed forth, I spelled W A T E R. She dropped the mug, went red and pale by turns and trembled. And the light of understanding came into her face. In that moment she realized that the finger motions were the names of things. All that day she quivered with excitement. and learned the name of every object she touched. And all that day my own heart was ready to burst with joy.\nAfter that she made rapid progress in all her studies. For three years she spelled on her fingers. The next step was learning to [typed correction] speak. She had observed that we did not use the hand spelling when we talked wit h each other. She felt us moving our lips and I told her that we talked with [handwritten caret with note: our] mouths. She wanted to talk with her mouth too. This seemed an impossible task. But Helen insisted that she wanted to talk like other people.\nI resolved if it was humanly possible she should be taught to speak. The first word she learned to speak was the little word, \"It\". She placed [typed correction] her hand so that her thumb rests on the throat, the first finger in the lips and, the second finger on the nose. That position gives the guttural sounds like G and K, the labials, P, B, the nasals M and [typed correction] N. With her hand in this position I made the vowel I several times, Helen imitating. I then made the consonants T, T, T, then put them together - IT, and the word was learned. After seven lessons she amazed [typed correction] me by speaking the words: \" I am not dumb now.”\nFrom that first halting sentence to her speech of today has been a [handwritten caret: long] hard road. For years she put her hand on my face, her fingers in my mouth, felt my tongue, imitated [handwritten strikethrough of a period] the positions and repeated them over and over, until she came to speak almost like other people. You [typed correction] will now have opportunity to hear [typed correction] her speak. While listening you must not forget that she had not heard her own voice or any sound since she was a baby.\n \nHELEN, [handwritten note above caret: \"What I have to say\"] to you is very simply. My Teacher has told you [handwritten: \"a\" followed by strikethrough: xxxxxxxxxxxxx xxxxx she taught xx. You have heard how xxxxxx.] word from her [handwritten spacing mark] and touched the darkness of my mind and I awoke to the gladness of life. I was dumb; now I speak. I owe this to the hands and the hearts of others through the love [handwritten strikethrough of: \"of others\"] I found my soul and God and happiness. Don't you see what [typed correction: xxx] it means? We live by each other and for each other. Alone we can do so little. Together we can do so much. Only love can break down the walls that stand between us and our happiness. [Handwritten strikethrough ineligible] The greatest [handwritten redaction] The greatest commandment is: \"Love ye one another\". I lift up my voice and thank the Lord for love and joy and the promise of life to come.\nVOICE off Stage:\nWonderful star of light!\nOut from the darkness of night,\nSending down a silver ray,\nTurning night-time into day.\nWonderful star of light,\nForever shining bright,\nAlways send your ray to me,\nEven to eternity.\nHELEN (raising right hand) This is my message of hope and inspiration to all mankind.\nCURTAIN.\n \n[Handwritten note in pencil: Personal matter Helen Keller]",
        "guidedDescriptionMode": GUIDED_DESCRIPTION_MODE_PER_IMAGE
      },
      {
        "id": "4A4",
        "title": "Photograph with Charlie Chaplin, 1918",
        "displayTitle": "Photograph with Charlie Chaplin",
        "year": "1918",
        "description": "Helen and companions Polly Thomson and Anne Sullivan took this photograph with Charlie Chaplin in a Hollywood film studio while he was filming \"Sunnyside.” Helen is said to have taught him the tactile sign-language alphabet she used to communicate.",
        "type": "photograph",
        "alt": "A black-and-white photograph shows Helen on a movie set next to Charlie Chaplin.",
        "images": [
          {
            "src": "4A4Chaplin1.png",
            "alt": "A black-and-white photograph shows Helen on a movie set next to Charlie Chaplin."
          },
          {
            "src": "4A4Chaplin2.png",
            "alt": "Back of photograph of Helen Keller with Charlie Chaplin, 1918",
            "guidedDescription": "A cream-colored photograph back is covered in large pencil writing: \"Charlie Chaplin,\" scattered letters, and \"In studio.\" A typed caption strip at the bottom describes Helen meeting Chaplin in California in 1918, with Polly Thomson and Anne Sullivan Macy. A gray label at top right reads \"PHOTO # 30013."
          }
        ],
        "guidedDescription": "In this black-and-white photograph, Polly Thomson, Anne Sullivan Macy, Helen Keller, and Charlie Chaplin sit left to right in a Hollywood film studio, with a camera and set behind them. The women wear matching jackets, long skirts, and hats. Helen touches Macy's lips and Chaplin's shoulder while gazing downward."
      },
      {
        "id": "4A5",
        "title": "Letter of Admission to Radcliffe College, 1899",
        "displayTitle": "Admission to Radcliffe College",
        "year": "1899",
        "description": "Radcliffe was originally a women’s college that was administered by Harvard before women were admitted there, some 50 years after Helen attended. Helen became the first deafblind person in the United States to earn a college degree after she was admitted to Radcliffe College in 1899.",
        "type": "document",
        "alt": "A Radcliffe College Certificate of Admission shows Helen's admission to the institution in 1899.",
        "images": [
          {
            "src": "4A5Radcliffe.png",
            "alt": "A Radcliffe College Certificate of Admission shows Helen's admission to the institution in 1899."
          }
        ],
        "transcriptTitle": "Transcript",
        "transcriptText": "[Round ensignia with the words: SIGILLVM ACADEMIAE RADCLIVIANNAE IN NOV ANG\" encircle a divided crest with stars on one side and two stripes on the other]\nRADCLIFFE COLLEGE\nCERTIFICATE OF ADMISSION.\nCambridge, [handwritten: July 4] 1899.\n[handwritten: Helen Adams Keller] is admitted to the FRESHMAN CLASS in Radcliffe College.\n[handwritten signature: Agnes Irwin]\nDean of Radcliffe College\n[handwritten: Miss Keller passed with credit in Advanced Latin.]",
        "guidedDescription": "A letter of admission from Radcliffe College, dated Cambridge, July 4, 1899, states that Helen Adams Keller is admitted to the freshman class. A round seal at the top shows a divided crest with stars and stripes. Agnes Irwin, Dean, signs it, and a handwritten note records Helen's credit in Advanced Latin."
      },
      {
        "id": "4A6",
        "title": "Perkins School Letter, 1886",
        "displayTitle": "Perkins School Letter",
        "year": "1886",
        "description": "In this 1886 letter, Perkins School Director Michael Anagnos asked Annie Sullivan if she was interested in “a position in the family of Mr. Keller as governess of his little deaf-mute and blind daughter.”  Helen is not even mentioned by name, a stark contrast to the closeness shared between the pair once they were together.",
        "type": "document",
        "alt": "A handwritten letter on Perkins School letterhead asks Anne Sullivan to work with Helen and her family.",
        "images": [
          {
            "src": "4A6Perkins.png",
            "alt": "A handwritten letter on Perkins School letterhead asks Anne Sullivan to work with Helen and her family."
          }
        ],
        "guidedDescription": "A handwritten letter to Anne Sullivan from Anagnos, asking her to become Helen's assistant, is written on Perkins Institution for the Blind stationery. Red calligraphy-style printing at the top gives institutional and date information. Ornate black cursive fills the entire page, following light blue printed lines.",
        "transcriptTitle": "Transcript",
        "transcriptText": "[Printed Text: Perkins Institution and Massachusetts School for the Blind. South Boston, handwritten text: August 26th 1886]\n\nMy dear Annie,\nPlease read the enclosed letters carefully and let me know at your earliest convenience whether you would be disposed to consider favorably an offer of a position in the family of Mr. Keller as governess of his little deaf-mute and blind daughter.\n\nI have no other information about the standing and responsibility of the man save that contained in his own letters; but, if you decide to be a candidate for the position, it is an easy matter to write and ask for further particulars.\n\nI remain dear Annie, with kind remembrances to Mrs. Hopkins,\n\nSincerely your friend,\nM. Anagnos\n\nMiss Annie M. Sullivan\nBrewster, Massachusetts"
      }
    ]
  }
};

export const themeOrder = ["change", "together", "adventure", "work"];

/** Transcript for the instructional / controls overview video. */
export const instructionalVideoTranscript =
  "The top row of buttons features the control options. To the far right are two buttons oriented vertically that adjust the volume. Use the plus to increase the volume and the minus to decrease the volume. To the left of the volume is the pause button, marked by the two-line pause symbol. Press this button at any time to pause the audio. To the far left of the pause button is the Settings button, marked by the cog shape. The bottom row features the navigation buttons. Directly below the Settings button is the Home button, which will take you back to the main menu. To the right of the Home button is the left arrow. Use the left arrow to go back when exploring content. Next is the circle button in the middle. Use this button to select content. And finally, use the right arrow to go forward when exploring content. When you are ready to begin, press any button.";

export function getTheme(themeId) {
  return themes[themeId] || null;
}

/** Short icon/poster alt for selection buttons and artifact-open speech. */
export function getArtifactAltText(artifact) {
  const alt = artifact?.alt || "TODO: placeholder alt text";
  return `Image: ${alt}`;
}

const THEME_SELECT_CTA = "Press select key to view the artifacts in this theme.";
const ARTIFACT_SELECT_CTA = "Press select key to learn more.";

/** Title + position only — NVDA appends "button" after this name. */
export function getThemeCarouselName(themeLabel, index, total) {
  return `${themeLabel}, ${index + 1} of ${total}`;
}

/**
 * Description after role "button". Leading ": . : . :" nudges a brief pause.
 * HomeScene speaks this via aria-describedby.
 */
export function getThemeCarouselDescription(themeId) {
  const iconAlt = themes[themeId]?.iconAlt;
  if (!iconAlt) return `: . : . : ${THEME_SELECT_CTA}`;
  const alt = iconAlt.replace(/\.\s*$/, "");
  return `: . : . : Image: ${alt}. ${THEME_SELECT_CTA}`;
}

/** @deprecated Prefer getThemeCarouselName + getThemeCarouselDescription */
export function getThemeFocusAnnouncement(themeId) {
  const iconAlt = themes[themeId]?.iconAlt;
  if (!iconAlt) return null;
  return `${iconAlt} ${THEME_SELECT_CTA}`;
}

/** @deprecated Prefer getThemeCarouselName + getThemeCarouselDescription */
export function getThemeCarouselLabel(themeId, themeLabel, index, total) {
  const position = getThemeCarouselName(themeLabel, index, total);
  const description = getThemeCarouselDescription(themeId);
  return description ? `${position}${description}` : position;
}

export function getArtifactCircleName(artifact, index, total) {
  const title = `${artifact.displayTitle}${artifact.year ? `, ${artifact.year}` : ""}`;
  return `${title}, ${index + 1} of ${total}`;
}

/** Description after role "button". Leading ": . : . :" nudges a brief pause. */
export function getArtifactCircleDescription(artifact) {
  const alt = getArtifactAltText(artifact).replace(/\.\s*$/, "");
  return `: . : . : ${alt}. ${ARTIFACT_SELECT_CTA}`;
}

export function getThemeArtifacts(themeId) {
  return themes[themeId]?.artifacts || [];
}

export function getArtifact(themeId, artifactId) {
  const arts = getThemeArtifacts(themeId);
  return arts.find(a => a.id === artifactId);
}

export function getArtifactIndex(themeId, artifactId) {
  const arts = getThemeArtifacts(themeId);
  return arts.findIndex(a => a.id === artifactId);
}

export function getNextArtifact(themeId, artifactId) {
  const arts = getThemeArtifacts(themeId);
  const index = arts.findIndex(a => a.id === artifactId);
  if (index === -1 || index >= arts.length - 1) return null;
  return arts[index + 1];
}

export function getPrevArtifact(themeId, artifactId) {
  const arts = getThemeArtifacts(themeId);
  const index = arts.findIndex(a => a.id === artifactId);
  if (index <= 0) return null;
  return arts[index - 1];
}

