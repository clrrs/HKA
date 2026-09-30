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

export const themes = {
  change: {
    id: "change",
    number: 1,
    label: "Change",
    descriptionMode: DESCRIPTION_MODE_SECTIONS,
    quote: "\u201CThe power of effecting changes for the better is within ourselves\u2026\u201D",
    description: "Helen Keller was a life-long advocate for change across society. Beginning with her fundraising campaign as a 10-year-old student, Helen was an advocate for voting, labor, and economic rights, in addition to working for several decades to advocate for people who were blind and deafblind.",
    iconAlt: "A black and white photo layered over documents shows Helen visiting veterans at a military hospital.",
    artifacts: [
      {
        id: "1A1",
        title: "Video of Korean War Visit, 1953",
        displayTitle: "Korean War Veteran Visit",
        year: "1953",
        description: 'Helen once stated that the work she did with veterans was the crowning experience of her life. Helen worked with wounded veterans from the First World War through the Korean War, as shown in this black-and-white film from 1953, in which Helen and Polly Thomson visit hospitalized veterans.',
        type: "video",
        videoSrc: "1A1VeteranVid.mp4",
        posterSrc: "1A1VeteranVid_frame.png",
        alt: 'A black-and-white image shows Helen laughing with a man in a hospital.',
        images: [],
        transcriptTitle: "Transcript",
        transcriptText: `Male audio description: In a medical institution, Helen and Polly stand aside men sitting on hospital beds.
Female narrator: The newly handicapped, the once whole young men who have come back from Korea disabled, these command as much as attention from Helen as did their brothers in the Second World War.  
Male audio description: She leans near a soldier.
Female narrator: Then as now she and Polly tramp the endless corridors of our military hospitals, bringing hope to the amputees, the blind, and the disabled.
Male audio description: Helen gently touches the man’s hair and face. The man grins and laughs with Helen.
Female narrator: Meeting Helen, seeing what she has made of her life, gives them more courage to reshape their own.
Male audio description: Polly translates into Helen’s hand as they stand near the men.
Female narrator: For her services she was cited at the close of World War II.`,
      },
      {
        id: "1A2",
        title: "IWW Conspiracy Speech, 1918",
        displayTitle: "IWW Conspiracy Speech",
        year: "1918",
        description: 'In one of her most passionate political writings, Helen’s 1918 speech defending The Industrial Workers of the World, a labor union and “movement of revolt,” states that IWW opponents did everything from labeling them as “dangerous foreigners” to accusing them of kidnapping and murder.  Helen joined the IWW in 1916, saying traditional political parties moved too slowly and didn\'t protect laborers.',
        type: "document",
        alt: 'A yellowed sheet of paper shows the first page of Helen\'s typed IWW Speech.',
        images: [
          { src: "1A2IWW1.png", alt: "Page 1 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW2.png", alt: "Page 2 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW3.png", alt: "Page 3 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW4.png", alt: "Page 4 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW5.png", alt: "Page 5 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `[Handwritten: Speeches 1918 Industrial Workers of the World]
The "I. W. W." Conspiracy [handwritten: -c]
Spoken on January 27, 1918. [handwritten: workers union -c] I am going to talk about the Industrial Workers of the World because [handwritten -c] they are so much in the public eye just now. They are probably the most loved and the most hated organization in existence. Certainly they are the most persistently misunderstood and misrepresented. The "Industrial Workers of the World" is a labor union based on the class struggle. It admits only wage-earners and acts on the principle of industrial unionism. It is a movement of revolt against the poverty, the cruelty and the ignorance that so many of us accept in blind content. [typed over with x's: The symbols] Its battle-ground is the field of industry. The symbols of the battle are the strike, the lock-out and the clash between employer and employed. It was founded in 1905 by men of bitter experience in the labor struggle, and in 1909 it began to attract nationwide attention. The McKee's Rocks strike first brought it to notice. [handwritten: -c] The textile strike of Lawrence, Mass., the silk workers' strike of [handwritten: c] Paterson, N. J. and the miners' strike of Calumet, Mich., made it notorious. Since 1909 it has been a militant force in America that employers have had to reckon with. It differs from the trade unions in that it emphasizes the idea of one big union in all the fields of industry. It points out that the
trade unions as at present organized are an obstacle to unity among the masses, and that this lack of solidarity plays them into the hands of their economic masters. The "I. W, W." [strikethrough: "I. W. W.'s"] affirm [strikethrough: affirms] a fundamental principle that the creators of wealth are entitled to all they create. Thus they find themselves pitted against the whole profit-making system. They declare that there
2
c-
can be no compromise so long as the majority of the workers live in want, while the master class lives in luxury. They insist that there can be no peace until the workers organize as a class, "take possession of the resources of the earth and the machinery of production and distribution and abolish the wage-system." In other words, the workers in their collectivity must own and operate all the essential industrial institutions and secure to each laborer the full [strikethrough: product] value of his product. It is for these principles, this declaration of class solidarity that the “I. W. W.’s" are being persecuted, beaten, imprisoned and murdered. Let me tell you something about the "I. W. W.’s" as I see them. They are the unskilled, the unnaturalized, the ill-paid, the submerged part of the working-class. They are mostly mill-workers, harvesters, lumber-men, miners and transport workers, We are told that they are "foreigners," "the scum of the earth," "dangerous." [strikethrough: Many of them] "Foreigners many of them are simply because the greater part of the unskilled labor in this country is foreign. "Scum of the earth?"— Perhaps. I know they have never had a fair chance. They have been starved in body and mind, denied, driven like slaves from job to job. "Dangerous?"-- May be. They know that the laws are for the strong--that they protect the class that owns everything. They know that in a contest with the workers employers do not respect the laws, but quite shamelessly break them* Witness the lunching of Frank Little in Butte, Montana, the flogging of seventeen men in Tulsa, Oklahoma, the forcible deportation of twelve hundred miners from Bisbee, Arizona, the burning to death of women and little children in the tents of Ludlow and the massacre of workers in Trinidad, Colorado. So the
"I. W. W.’s" respect the laws only as a soldier respects an enemy.
3
Can you find it in your hearts to blame them? I love them because of their needs, their miseries and their daring spirit. It is because of this spirit that the master class fears and hates them, and the poor and oppressed love them with a great love. The oft-repeated charge that the "I. W. W." is organized to hinder industry is false. It is organized to keep industries going. By organizing industrially they are “forming the structure of the new society in the shell of the old." Industry rests on the iron law of economic determinism. All history reveals the fact that economic interests are the strongest ties that bind men together. That is not because men’s hearts are evil and selfish. mIt[sic] is only a result of the inexorable law of life. The desire to live is the basic principle that compels men and women to seek a more suitable environment, so that they may live better and more happily. Now, don’t you see, it is impossible to maintain an economic order that keeps wages practically at a standstill, while the cost of living mounts higher and ever higher? The day will come when the tremendous activities of the War will subside. The master class will inevitably find itself face to face with a starving multitude of unemployed workers demanding food, or the destruction of the social order that has starved them and robbed them of their jobs. In such a crisis the master class cannot save itself. Its police and its armies will be powerless to put down the last revolt. For at last man will take his own, nor count the cost. When that day dawns, if the workers are not thoroughly organized, they may easily become a blind force of destruction, unable to check their own momentum, their cry for justice drowned in a howl of rage. Whatever is good and beneficent in our civilization can be saved only by the workers, and the "I. W. W." is
4
formed with, the object of carrying on the work of the world when capitalism is overthrown. Whether the ”I. W, W." increases in power, or is crushed out of existence, the spirit that animates it is the spirit that must animate the labor movement if it is to have a revolutionary function. Down through the long, weary years the will of the master class has been domination and suppression, either of the man or his message, especially if the man or his message antagonized its interests. From the execution of the propagandist to the suppression of the writer down through the various degrees of censorship and expurgation to the highly civilized legal indictment the cry has ever been “Crucify him." Now the master class has willed into jail one hundred and sixty-six "I. W. W.“ officers, members and sympathizers. They are in Chicago, [handwritten: -c] awaiting trial on the charge of conspiracy. While they are meeting the hardest ordeal, while the jury is trying to weigh the evidence, how shall we feel towards them? Shall our attitude be one of anger and vengeance, or one of sympathy and justice? Shall we throw into the scale the fighting sword of hate? For my part, I sympathize with them. While they are threatened and imprisoned, I am manacled. If they are denied a living wage, I, too, am defrauded. My hunger is not satisfied while they are unfed. I cannot enjoy the good things of life that come to me while they are hindered and neglected. When they are flung out upon a desert under a scorching sun, I, too, burn, and my soul is athirst. When one of them is dragged from his bed and hung to a railroad trestle, a great horror of darkness falls upon my spirit, and from the depths of my heart I cry out against those who persecute the weak and unfriended.
5
Next month, those one hundred and sixty-six “I. W. W.'s" will be tried in a government court. The newspapers will be full of stupid, if [handwritten: press] not malicious accounts of the trial. Let us keep an open mind. Let us try to preserve the integrity of our judgment against the ignorance, misrepresentation and [strikethrough: prejudice] cowardice of the day. Let us refuse to yield to lies and censure. Let us keep our hearts tender towards those who are struggling mightily against the greatest evils of the age.
Helen Keller`,
        guidedDescription: 'A yellowed sheet shows the first of five pages of Helen\'s typed IWW speech. A central crease marks where it was once folded. Pencil in the top right corner notes "Speeches 1918, Industrial Workers of the World." Holes in the top left corner show where pages were bound.',
      },
      {
        id: "1A3",
        title: "Women\u2019s Suffrage Speech, 1920",
        displayTitle: "Women\u2019s Suffrage Speech",
        year: "1920",
        description: 'Helen wrote in this 1920 speech, called "Why Woman Wants to Vote", in support of the 19th Amendment, which was passed later that year. Helen argues in this speech that women\'s right to vote, along with all other rights, are only earned when we are strong enough to claim them for ourselves, as evidenced by this quote: “Today women are asserting their rights, tomorrow nobody will be foolhardy enough to question them.”',
        type: "document",
        alt: 'A yellowed sheet of paper with torn edges and corners shows the first page of Helen\'s typed speech about women\'s voting rights.',
        images: [
          { src: "1A3Suffrage1.png", alt: "Page 1 of Helen Keller\u2019s Women\u2019s Suffrage Speech, 1920" },
          { src: "1A3Suffrage2.png", alt: "Page 2 of Helen Keller\u2019s Women\u2019s Suffrage Speech, 1920" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `Why Woman Wants to Vote.
[Handwritten note at top of page: illegible]
[Handwritten: HK. Speeches 1920 "Why woman wants to vote" 1920 Speeches 1920
We demand the vote, not because we think we are better or wiser than
men, but because it is our right as much as it is theirs. And even if we all vote together, we cannot abuse this right more than the men have done by themselves. There is already a good deal wrong with the world-- any one who reads at all intelligently knows that. Perhaps one of the chief reasons for the chaotic conditions of things is, that the world has been trying to get along with only half of itself. The two parts are unlike,
and it takes both to make a whole. [Handwritten brackets around this sentence; purpose unclear] We demand the vote for women because it is in accordance with the prin ciples of a true democracy. Many labor under the delusion that we live in a democracy. I have to smile-- several ways-- when I read that ours is "a government of the people, by the people, and for the people.” We are neither a democracy nor a true representative republic. We are a government of parties and partisans, and lo, at least half the adult population may not even belong to these parties! We demand woman suffrage also because without it women cannot protect themselves and their children. Some people like to imagine that the chivalrous nature of man will constrain him to act humanely towards woman and protect her rights. SOME men do protect some women. We demand that all women have the right to protect themselves. Political power intelligently used, enables the citizen to direct and shape the legal affairs of the state and determine what shall be the relations of human beings to each other, individually and collectively. Without this power, women who do not happen to have a "natural protector" are at the mercy of man-made laws, and experience shows that these laws are often unjust to them. In some states of this "enlightened democracy" of men the father is the sole owner of the child. I believe he can even will away the unborn babe. In some states women cannot hold property, and their wages belong to their fathers or their husbands. Legislation concerning the age of [Handwritten caret mark between sentences; purpose unclear] consent is another proof that the voice of woman is mute in the halls of the law-makers. Surely, women are not isolated beings, puppets in the world to be manipulated by men.
)Put this after sentence about tyranny wearing mask 3/4 Anyway, the fight is on, and I advise [Handwritten edit: any] men who [Handwritten edit: is] still hesitating [sic.] to hurry [handwritten: up] and get on the right side. For there will soon be a terrific struggle between democracy and autocracy-- as a matter of fact, it has begun,
Their old-fashioned ideas are up a tree, and traditions are breaking up, and the new plans are arriving. It is time to take a good look.
) After sentence about men and women working together to solve problems We do not want a woman’s world or a man’s [deleted: either], but a human world no longer cursed by misery, ignorance, disease and crime. We want a world where there is fair play in every relation of life-- an equitable [strikethrough: inelligble] distribution of human comfort and happiness, a just amount of labor for every one, a real living wage, the security of every worker from oppression of one or many, and. [handwritten: underline of "Everywhere"] Everywhere, in all countries, in all classes we see woman-force running to waste that should be utilized in making the world a decent home for all humanity.
) Last paragraph, I think 3/4 There are no such things as "divine, immutable, inalienable rights." Rights are things which we get when we are strong enough to make our claim to them good. Today women are asserting their rights tomorrow nobody will be foolhardy enough to question them. [handwritten curly bracket around this paragraph]`,
        guidedDescription: 'A yellowed, torn sheet shows page one of Helen\'s typed speech on women\'s voting rights. Holes in the top left corner show where pages were bound. The title, "Why Woman Wants to Vote," is underlined in red. Faded pencil fills the top margin. Pencil brackets surround one sentence that reads \'Perhaps one of the chief reasons for the chaotic condition of things is that the world has been trying to get along with only half of itself. The two parts are unlike, and it takes both to make a whole.\'',
      },
      {
        id: "1A4",
        title: "Letter from the ACLU, 1919",
        displayTitle: "Letter from the ACLU",
        year: "1919",
        description: 'By 1919, Helen was already sought after for her advocacy work. In this letter to Helen from The National Civil Liberties Bureau, key members of the organization write to Helen to share their plans for reorganization and to ask her to join them, insisting they want her to be an active member in their future work. Helen became a founder of the American Civil Liberties Union, which grew out of the National Civil Liberties Bureau.',
        type: "document",
        alt: 'A yellowed sheet of paper shows the first page of a typed letter to Helen from the National Civil Liberties Bureau.',
        images: [
          { src: "1A4ACLU1.png", alt: "Page 1 of letter from the ACLU to Helen Keller, 1919" },
          { src: "1A4ACLU2.png", alt: "Page 2 of letter from the ACLU to Helen Keller, 1919" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `[Printed letterhead] OFFICERS L. Hollingsworth Wood, Chairman Norman M. Thomas, Vice Chairman Helen Phelps Stokes, Treasurer Albert De Silver, Director Paul J. Furnas, Associate Director Walter Nelles, Counsel
[Printed Letterhead] NATIONAL CIVIL LIBERTIES BUREAU 41 UNION SQUARE, NEW YORK
30-Dec-19
[Printed letterhead] DIRECTING COMMITTEE The Officers and Roger N. Baldwin John S. Codman Crystal Eastman John Lovejoy Elliott Edmund C. Evans Edward W. Evans William M. Fincke John Haynes Holmes Agnes Brown Leach Judah L. Magnes John Nevin Sayre
Miss Hellen Keller, Forest HilIs, L.I, Dear Miss Keller:-
We desire to get your active co-operation in completely reorganizing the work of this Bureau, to aid in the present struggles of labor for freedom of speech, press and assemblage. First let us put before you the essential facts about the Bureau.
The Bureau was organized during the war to deal with war-time problems of freedom of opinion and of conscience. It was not an anti-war organization. It simply insisted on American constitutional rights for those who were opposed to the war. Among its supporters and directing committee were persons who vigorously supported the war, though the state of public opinion made it possible to secure the active support of only a few such. The Bureau’s work for persons and groups attacked under war statutes has now practically ended. There remains only the effort to secure an amnesty for political, industrial and military prisoners, including the few score conscientious objectors still in prison.
But a vastly bigger work in the struggle for civil liberty has opened up. It is a challenge to every believer in industrial democracy, to every champion of free expression of opinion. Our little group cannot effectively serve so great a need.
We have therefore decided to completely reorganize the Bureau’s work by inviting the persons whose names appear on the enclosed list to associate themselves together in a new organization. We are asking those who can do so to meet in conference on Monday, January 12th, 1920, at the Civic Club, 14 West 12th Street, New York City, for luncheon, at 1 ’ clock to effect the reorganization of the work. The present assets, records and organization of the Bureau will be put entirely at the disposal of the new group. A statement of the issue, the work and the plans as we see them now, is enclosed.
-2- F.K. -
We ask you to join this group. This is no perfunctory request for "the use of your name". Your active service in shaping the policies of the new work is urgently needed. Members who cannot come to meetings would be consulted by letter. All the details would be handled by a local directing committee in New York City, The service of other members of the national committee would consist in giving their judgment on matters of policy and publicly backing the work for civil liberty in the industrial struggle. We cannot take "no" for your answer without the most evident reasons. Rather than take your declination to serve we will go to put the case before you personally. The emergency is too real, the challenge too clear, the service too great for any one of us to fail to help in what promises to be an effective piece of work in the struggle of labor. If this does not convey all the information you wish to have before making a decision, we will be glad to answer any inquiries by letter, or if practicable, by a personal visit to you. Your frank comments on the proposal and the personnel of the organization are invited. As you see what we propose in effect is a new organization to meet new issues. The present Civil Liberties group stand ready to assist in any way in which the members of the new group feel will be really helpful.
Sincerely yours, [handwritten signatures: L. Hollingsworth Wood; Norman Thomas; Albert De Silver; Roger N. Baldwin]
[handwritten: 20, 9]`,
        guidedDescription: 'A yellowed sheet of National Civil Liberties Bureau letterhead, dated December 30, 1919, shows a typed letter to Helen at Forest Hills, Long Island. Blue printed lists of officers and directing committee members flank the top corners. Faint pencil marks lie beneath the committee list. Torn holes show where pages were bound.',
      },
      {
        id: "1A5",
        title: "Letter to the NAACP, 1916",
        displayTitle: "Letter to the NAACP",
        year: "1916",
        description: 'Helen wrote to Mr. Oswald Garrison Villard, then-Vice President of the National Association for the Advancement of Colored People, in 1916 to express her solidarity with their movement: “It should bring the blush of shame to the face of every true American to know that ten of millions of his countrymen are denied the equal protection of the laws.” Helen donated $100 to the NAACP, today\'s equivalent of more than $3,000.',
        type: "document",
        alt: 'A yellowed sheet of paper shows the first page of a typed letter from Helen to the NAACP.',
        images: [
          { src: "1A5NAACP1.png", alt: "Page 1 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP2.png", alt: "Page 2 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP3.png", alt: "Page 3 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP4.png", alt: "Page 4 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP5.png", alt: "Page 5 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP6.png", alt: "Page 6 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP7.png", alt: "Page 7 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP8.png", alt: "Page 8 of Helen Keller\u2019s letter to the NAACP, 1916" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `[Printed letterhead has image of a winged dragon enveloped in a garland the words "THE WALDO" are inside a ribbon beneath the emblem. Typeface: FIRE PROOF CLARKSBURG,W.VA. R.J.GAZLEY, PROPR.

Sent? [handwritten text]

W VA [handwritten]

[Handwritten note: NT'L. Assn. for the Advance-ment of Colored People]

H.K. P.R - 1916

February 13, 1916.

Clarksburg, West Virginia, February 13, 1916

Mr. Oswald Garrisen Villard, Vice-President of the National Association for the Advancement

of Colored People.

Dear Mr. Villard,

It has been my intention to write to

you every day since I received your letter— an appeal which smote me to the depths of my soul. In fact, I have started several letters while travelling from place to place, but was interrupted so frequently that I lost the thread of thought between lectures. We are speaking every night and changing trains constantly. These conditions are not favorable for correspondence. [handwritten bracket before this sentence; closing bracket appears on page 4] I am indeed, wholeheartedly with you and the National Association for the Advancement of Colored People. I warmly endorse your efforts to bring before the country the facts about the unfair treatment of the colored people in some parts of the United States. What a comment

CLARKSBURG,W.VA. R.J. GAZLEY, PROPR.

upon our social justice is the need of an association like yours! It should bring the blush of shame to the face of every true American to know that ten millions of [typed: the people — struck through] [Handwritten insertion above: his countrymen] are denied the equal protection of the laws. Truly no nation can live and not challenge such discrimination and violence against innocent members of society as your letter describes. Nay, let me say it, this great republic of ours is a mockery when citizens in any section are denied the rights which the Constitution guarantees them, when they are openly evicted, terrorized and lynched by prejudiced mobs, and their persecutors and murderers are allowed to walk abroad unpunished. The United States stands ashamed before the world whilst ten millions of its people remain victims of a most blind, stupid, inhuman prejudice. How dare we call ourselves Christians? The outrages against the colored people are a denial of Christ. The central fire of his teaching is equality. His gospel proclaims in unequivocal words that the souls

[Printed Logo of THE WALDO - FIRE PROOF - CLARKSBURG, W. VA. R.J.GAZLEY, PROPR.

of all men are alike before God. Yet there are persons calling themselves Christians who profit from the economic degradation of their colored fellow-countrymen. Ashamed in my very soul I behold in my own beloved south-land the tears of those who are oppressed, those who must bring up their sons and daughters in bondage to be servants, because others have their fields and vineyards, and on the side of the oppressor is power. I feel with those suffering, toiling millions, I am thwarted with them. Every attempt to keep them down and crush their spirit is a betrayal of my faith that good is stronger than evil, and light stronger than [strikethrough: evil; handwritten: darkness]. I declare this faith every day to large audiences, and in my heart I pray that God may open the eyes of the blind, and bring them by a way they know not unto understanding and righteousness. My spirit groans with all the deaf and blind of the world, I feel their chains chafing my limbs. I am disenfranchised with every wage-slave. I am overthrown, hurt, oppressed, beaten to the earth by the strong, ruthless ones who have taken

[Printed Logo of THE WALDO] FIRE PROOF - CLARKSBURG, W.VA. R.J.GAZLEY, PROPR.

away their inheritance. The wrongs the poor endure ring fiercely in my soul, and I shall never rest until they are lifted into the light, and given their fair share in the blessings of life that God meant for us all alike. Let all lovers of justice unite, let us stand together and fight every custom, every law, every institution that breeds, or masks violence and prejudice, and permits one class to prosper at the cost of the well-being and happiness of another class. Let us hurl our strength against the iron gates of prejudice until they fall, and their bars are sundered, and we ail advance gladly towards our common heritage of life, liberty and light, undivided by race or color or creed, united by the same human heart that beats in the bosom of all. [handwritten closing bracket corresponding to opening bracket on page 1.] Cordially wishing you and the Association every success in your noble work, I am. Sincerely yours,

[Handwritten: West VA Feb. 1916 To: Villard, Vice President of National Association for the Advancement of Colored People]

I am indeed whole-heartedly with you and the National Association for the Advancement of Colored People. I warmly endorse your efforts to bring before the country the facts about the unfair treatment of the colored people in some parts of the United States. What a comment upon our social justice is the need of an association like yours! It should bring the blush of shame to the face of every true American to know that ten millions of his country men are denied the equal protection of the laws. Truly no nation can live and not challenge such discrimination and violence against innocent members of society as your letter describes. Nay, let me say it, this great republic of ours is a mockery when citizens in my section are denied the rights which the Constitution guarantees them, when they are openly evicted, terrorized and lynched by the prejudiced mobs, and their persecutors and murderers are allowed to walk abroad unpunished. The United States stands ashamed before the world whilst ten millions of its people remain victims of a most blind, stupid, inhuman prejudice. How dare we call ourselves Christians? The outrages against the colored people are a denial of Christ. The central fire of his teaching is equality. His gospel proclaims in unequivocal words that the souls of all men are alike before God. Yet there are persons calling themselves Christians who profit from the economic degradation of their colored fellow-country-

men

Ashamed in my very soul I behold in my own beloved southland the tears of those who are oppressed, those who must bring up their sons and daughters in bondage to be servants, because others have their fields and vineyards, and on the side of the oppressor is power. I feel with those suffering, toiling millions, I am thwarted with them. Every attempt to keep them down and crush their spirit is a betrayal of my faith that good is stronger than evil, and light stronger than darkness. I declare this faith every day to large audiences, and in my heart I pray that God may open the eyes of the blind, and bring them by a way they know not unto understanding and righteousness. My spirit groans with all the deaf and blind of the world, I feel their chains chafing my limbs. I am disenfranchised with every wage-slave. I am overthrown, hurt, oppressed, beaten to the earth by the strong, ruthless ones who have taken away their inheritance. The wrongs the poor endure ring fiercely in my soul, and I shall never rest until they are lifted into the light, and given their fair share in the blessings of life that God meant for us all alike. Let all lovers of justice unite, let us stand together and fight every custom, every law, every institution that breeds, or masks violence and prejudice, and permits one class to prosper at the cost of the well-being and happiness of another class. Let us hurl our strength against the iron gates of prejudice until they fall, and their bars are sundered.

and we all advance gladly towards our common heritage of life, liberty and light, undivided by race or color or creed, united by the same human heart that beats in the bosom of all.

National Association for the Advancement of Colored People

[handwritten: for the Adv. of Colored Peo.]

70 FIFTH AVENUE, NEW YORK

February 15, 1916, Received from Helen Keller One Hundred Dollars for,

Donation

$100.00

[Printed Stamp: Allied Printing 256 Trades Council Union Label New York City][Handwritten Signature: Oswald Garrison Villard] Treasurer`,
        guidedDescription: 'A yellowed sheet shows page one of seven of Helen\'s typed letters to the NAACP. Holes and dried glue mark the top left corner, beside a hotel logo of a dragon in a wreath above a banner reading "The Waldo." Pencil adds "Sent?" and archival notes, plus marks throughout.',
      },
      {
        id: "1A6",
        title: "Blindness Prevention Article, 1914",
        displayTitle: "Blindness Prevention Article",
        year: "1914",
        description: "Published in \u201CThe Nurse\u201D in 1914, Helen\u2019s article candidly discusses women who are forced into prostitution by poverty, and children who were born blind due to sexually transmitted infections. She also laments the modesty in language that prevents discussion, and ultimately prevention, of the problem.",
        type: "document",
        images: [
          { src: "1A6PrevBlind1.png", alt: "Page 1 of Helen Keller\u2019s Blindness Prevention Article, 1914" },
          { src: "1A6PrevBlind2.png", alt: "Page 2 of Helen Keller\u2019s Blindness Prevention Article, 1914" },
          { src: "1A6PrevBlind3.png", alt: "Page 3 of Helen Keller\u2019s Blindness Prevention Article, 1914" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Three pages of an article show torn gaps in the paper where it was ripped from the three staples in a magazine binding. A black and white photograph heads the article, showing Helen in a hat with a large feather on front, a light dress with a bow closing the collar, and a bouquet of leafy flowers. Archivist's cataloging notes near the top of the first page note that this article is incomplete."
      }
    ]
  },

  together: {
    id: "together",
    number: 2,
    label: "Together",
    descriptionMode: DESCRIPTION_MODE_SECTIONS,
    quote: "\u201CTogether we can do so much.\u201D",
    description: "Relationships were an essential part of Helen Keller\u2019s growth, education, and her accomplishments. Through friends across both society and the globe, known and unknown, Helen knew that collaboration was the key to success.",
    iconAlt: "Helen's gold door knocker is layered over handwritten notecards.",
    artifacts: [
      {
        id: "2A1",
        title: "Letter from Eugene Debs, 1919",
        displayTitle: "Letter from Eugene Debs",
        year: "1919",
        description: 'Eugene Debs, a former socialist presidential candidate, trade unionist, and Southern Indiana native, wrote this letter to Helen while serving a 10-year prison sentence for sedition after he delivered a 1918 speech urging resistance to the military draft. Debs would go on to run for president in 1920 while still imprisoned.',
        type: "document",
        alt: 'A handwritten document shows the first page of a handwritten letter to Helen from socialist Eugene Debs.',
        images: [
          { src: "2A1Debs1.png", alt: "Page 1 of letter from Eugene Debs to Helen Keller, 1919" },
          { src: "2A1Debs2.png", alt: "Page 2 of letter from Eugene Debs to Helen Keller, 1919" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'A document shows the first of two pages of a handwritten letter to Helen from socialist Eugene Debs. West Virginia Penitentiary letterhead has blanks for sender and recipient above a floral design. Blue-lined paper is filled with cursive. Creases and a faint upside-down watermark show.',
      },
      {
        id: "2A2",
        title: "Letter to General MacArthur, 1949",
        displayTitle: "Letter to General MacArthur",
        year: "1949",
        description: 'Although Helen and General MacArthur, a top US general during WWII, could not have been more dissimilar in their career paths or politics, the two worked closely and successfully during her post-war trip to Occupied Japan. In this warm and cordial letter, Helen thanks him for bringing international attention to the needs of blind and disabled people in the post-WWII-ravaged nation.',
        type: "document",
        alt: 'A yellowed sheet of paper shows the first page of a typed letter from Helen to General MacArthur.',
        images: [
          { src: "2A2MacA1.png", alt: "Page 1 of Helen Keller\u2019s letter to General MacArthur, 1949" },
          { src: "2A2MacA2.png", alt: "Page 2 of Helen Keller\u2019s letter to General MacArthur, 1949" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'A yellowed sheet shows page one of two of Helen\'s typed letter to General MacArthur. Two vertical creases and one horizontal crease cross the center. Minor corrections in pen and pencil appear throughout. Holes in the top left corner show where pages were bound.',
      },
      {
        id: "2A3",
        title: "Letter from Mark Twain, 1905",
        displayTitle: "Letter from Mark Twain",
        year: "1905",
        description: 'Despite a 40-year age difference, Helen Keller and Mark Twain maintained a lengthy friendship based on their love of humor and their shared politics. In this handwritten letter of thanks from Mark Twain on his 70th birthday, he adds a very personal note to Helen on the back, signing off with both “loves”, and his real name, Samuel L. Clemens.',
        type: "document",
        alt: 'A sheet of paper shows the first page of a handwritten letter to Helen from Mark Twain.',
        images: [
          { src: "2A3Twain1.png", alt: "Front of handwritten letter from Mark Twain to Helen Keller, 1905" },
          { src: "2A3Twain2.png", alt: "Back of handwritten letter from Mark Twain to Helen Keller, 1905" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'A sheet of paper shows the first of two pages of a handwritten letter from Mark Twain to Helen. His cursive script fills the page. On this first page, the signature of "Mark Twain" is in a darker ink, along with the phrase "over," indicating text on the back.',
      },
      {
        id: "2A4",
        title: "Student Christmas Letters, 1934",
        displayTitle: "Student Christmas Letters",
        year: "1934",
        description: 'After reading about the talking book program at the American Foundation for the Blind, third- and fourth-grade students from Wrangell, Alaska wrote Helen about publishing a small pamphlet of their own writing.  They sold each copy for 2 cents and donated the money to the American Foundation for the Blind to show the spirit of giving during the holidays.  Their daily lives were also detailed as only students of that age could.',
        type: "document",
        alt: 'A quarter sheet of paper shows an envelope of one 15 student letters to Helen from Wrangell, Alaska. A handwritten postcard is addressed to Helen from third and fourth graders at Wrangell Public Schools.',
        images: [
          { src: "2A4Student1.png", alt: "Student Christmas letter to Helen Keller, letter 1 of 6" },
          { src: "2A4Student2.png", alt: "Student Christmas letter to Helen Keller, letter 2 of 6" },
          { src: "2A4Student7.png", alt: "Student Christmas letter to Helen Keller, letter 3 of 6" },
          { src: "2A4Student5.png", alt: "Student Christmas letter to Helen Keller, letter 4 of 6" },
          { src: "2A4Student12.png", alt: "Student Christmas letter to Helen Keller, letter 5 of 6" },
          { src: "2A4Student3.png", alt: "Student Christmas letter to Helen Keller, letter 6 of 6" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescriptionMode: GUIDED_DESCRIPTION_MODE_LETTERS,
        letterSections: [
          { imageIndices: [0], guidedDescription: 'A quarter sheet of paper shows an envelope of one 15 student letters to Helen from Wrangell, Alaska. In the upper left corner is the Wrangell Public Schools header. A red ink, 3-cent postage stamp is near the top right corner. Handwritten text under it shows Helen\'s Forest Hills address, where the letters were sent. Additional, illegible handwritten text is on the right side in black and red ink.' },
          { imageIndices: [1], guidedDescription: 'A cream sheet holds a handwritten letter in blue ink, dated January 30, 1933, from Elizabeth Aitken in Wrangell, Alaska, to Miss Keller. A large gray "Helen Keller" stamp and a "Received, February 16, 1933" stamp sit at right. Pencil and red notes cover the margins.' },
          { imageIndices: [2], guidedDescription: 'A cream, blue-lined sheet holds a short letter in blue ink, dated May 16, 1934, from Robert Shermer in Wrangell, Alaska, to Miss Keller. The writer wishes to talk with her by radio and describes his terrier, Wimpy. A crossed-out word interrupts the final line, and a faint brown stain marks the page.' },
          { imageIndices: [3], guidedDescription: 'A yellowed, blue-lined sheet holds a short pencil letter in neat cursive, addressed "Dear Miss Keller" and dated May 16, 1934, from Wrangell, Alaska. A child writes about a framed photograph, a talking book, and a bulldog. A few small holes dot the top left corner.' },
          { imageIndices: [4], guidedDescription: 'A cream, blue-lined sheet holds a letter in dark ink, dated December 10, 1934, from Richard Stokes in Wrangell, Alaska, to Miss Keller. Small pencil notes at top right give his name and the year. One word is crossed out and "fourth" is written above it. Small holes dot the top left.' },
          { imageIndices: [5], guidedDescription: 'A yellowed typed letter dated February 24, 1933, is addressed to Miss Elizabeth Aitkin of Wrangell, Alaska, and signed by Eber L. Palmer, Assistant Director. Pencil at the top right reads "Wrangell (Alaska) Public School." A gray "For Archives" stamp and handwritten initials and date sit beside the greeting.' },
        ],
      },
      {
        id: "2A5",
        title: "Arcan Ridge Door Knocker",
        displayTitle: "Arcan Ridge Door Knocker",
        year: "1947",
        description: 'This knocker hung on the door of Helen’s Easton home on Arcan Ridge from 1946 to 1968. What important visitors may have used it over those decades, visiting Helen with important work or exuberant celebrations?',
        type: "object",
        alt: 'Helen\'s home door knocker is inscribed with her first and last name.',
        images: [
          { src: "2A5DoorKnock.png", alt: 'Helen\'s home door knocker is inscribed with her first and last name.' }
        ],
        guidedDescription: 'A cast brass door knocker shaped like an urn has finials on its top and bottom.  A flat faceplate near the middle of the urn is engraved with "HELEN KELLER."  A swinging, horseshoe-shaped striker hangs from the sides of the faceplate.',
      },
      {
        id: "2A6",
        title: "Letter Requesting FDR Autograph, 1929",
        displayTitle: "Letter Requesting FDR Autograph",
        year: "1929",
        description: 'Having received a typewritten letter from Gov. Franklin D. Roosevelt declining membership in the American Foundation for the Blind, Helen replied on the reverse with a handwritten note requesting his autograph.  The only autograph she had ever asked for, she wanted to make her request before he became the President of the United States. Four years later, he was elected to that position.',
        type: "document",
        alt: 'A typed document on State of New York letterhead features a letter to Helen from Franklin Delano Roosevelt.',
        images: [
          { src: "2A6FDR1.png", alt: "Page 1 of Helen Keller\u2019s letter requesting FDR\u2019s autograph, 1929" },
          { src: "2A6FDR2.png", alt: "Page 2 of Helen Keller\u2019s letter requesting FDR\u2019s autograph, 1929" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'Franklin Roosevelt\'s typed letter to Helen is on State of New York letterhead. A gold seal shows an eagle above a shield with a rising sun and ships, flanked by two robed women, over a scroll reading "Excelsior." Blue office details, one edit, and an ink signature complete it.',
      }
    ]
  },

  adventure: {
    id: "adventure",
    number: 3,
    label: "Adventure",
    descriptionMode: DESCRIPTION_MODE_SECTIONS,
    quote: "\u201CLife is either a daring adventure or nothing at all.\u201D",
    description: "Whether exploring one of the 39 different countries she traveled to, or piloting an airplane over Europe, Helen\u2019s lust for adventure was an inspiration to the world. Each of her travels left a lasting impression on the people and nations that she visited.",
    iconAlt: "A black and white image of Helen with a Bantu chief is layered with a Japanese luncheon set and travel documents.",
    artifacts: [
      {
        id: "3A1",
        title: "Helen Keller Takes a Ride in an Airplane",
        displayTitle: "Helen Keller Takes a Ride in an Airplane",
        year: "1919",
        description: 'The 1919 silent biographical film “Deliverance” tells the story of Helen\'s life in three acts: Childhood, Maidenhood, and Womanhood. Helen plays herself in this movie. In this clip, she rides in the open cockpit of a biplane.',
        type: "video",
        videoSrc: "3A1Biplane.mp4",
        posterSrc: "3A1Biplane_frame.png",
        alt: 'A black-and-white image shows Helen preparing to ride in an airplane.',
        images: [],
        transcriptTitle: "Transcript",
        transcriptText: `From Female narrator: It showed her first airplane ride. A daring feat at that time.
Male audio description: In old, black-and-white footage, elegantly-dressed women help tidy Helen’s leather coat.
[engine rumbles]
Male audio description: She also wears a tight leather helmet on her head. An airplane drives across a field and takes off into the air. On the ground, Helen’s friends watch excitedly as the plane flies high in the sky.
[uplifting orchestral music]
Male audio description: Helen rides in the front and a pilot steers in the back of the two-seater aircraft. Wind flies over their heads in the open, roofless plane. The airplane safely lands on the flat, grassy ground. Dozens of people rush to the parked plane and assist Helen out of the sunken seat. Helen smiles broadly and hugs her teacher Anne Sullivan Macy.`,
      },
      {
        id: "3A2",
        title: "Japanese Luncheon Set, 1948",
        displayTitle: "Japanese Luncheon Set",
        year: "1948",
        description: 'Kazuo Honma, a blind Japanese activist, educator, and founder of the National Library for the Blind in Japan, gifted Helen a black lacquer New Year\'s luncheon set in 1948 as a token of his admiration for her. Two photos show the luncheon set in detail.',
        type: "object",
        alt: 'A Japanese luncheon set is unassembled to show all of its contents.',
        images: [
          {
            src: "3A2Lunch1.png",
            alt: 'A Japanese luncheon set is unassembled to show all of its contents.',
          },
          {
            src: "3A2Lunch2.png",
            alt: "Japanese luncheon set assembled in its carrying stand",
            guidedDescription: 'The luncheon set fits neatly back together, with all items inside the carrying stand with the brass top.',
          }
        ],
        guidedDescription: 'All items in the luncheon set feature gold decorations showing plants, symbols, and designs. Golden and carved abalone inlays show birds facing each other in a triangular pattern. An outer carrying stand with brass top handle holds six drawers, each with a red interior. One medium sized tray, five smaller trays, a removable bottle holder, and a pair of pewter cylinder bottles all fit into the carrying stand.',
      },
      {
        id: "3A3",
        title: "Photograph with Bantu Chief, 1951",
        displayTitle: "Photograph with Bantu Chief",
        year: "1951",
        description: 'Helen traveled to East London, South Africa to open the Duncan Village Community Center for Bantu People on April 11, 1951. Like other segregated locations in South African cities, Duncan Village demonstrated the extreme inequality between black and white residents under the country’s system of apartheid.',
        type: "photograph",
        alt: 'A black-and-white image shows Helen with a Bantu chief and his wife.',
        images: [
          { src: "3A3Bantu1.png", alt: 'A black-and-white image shows Helen with a Bantu chief and his wife.' },
          {
            src: "3A3Bantu2.png",
            alt: "Back of photograph of Helen Keller with a Bantu chief",
            guidedDescription: 'Pencil on the back of the photograph repeats the caption about Helen opening the Duncan Village Community Center, and asks that it be returned to the American Foundation. Red ink reads "14 1/2 picas" with an arrow marking the width. A rectangular stamp reads "Wyndon Photos."',
          }
        ],
        guidedDescription: 'In this black-and-white photograph, Helen and Polly Thomson pose with a Bantu chief and his wife. The chief, draped in beaded necklaces and belts, holds a spear as Helen feels its tip. His wife wears a large cloth hat and painted facial dots. Helen and Polly wear striped dresses.',
      },
      {
        id: "3A4",
        title: "Global Travel Schedule, 1948-49",
        displayTitle: "Global Travel Schedule",
        year: "1948\u201349",
        description: 'This travel itinerary details Helen’s travels from March of 1948 to April 1949, when she embarked on a global journey including visits to Australia, Korea, China, Thailand, India, Syria, and more, to meet with officials about the welfare of blind people in their respective countries.',
        type: "document",
        alt: 'A typed document outlines Helen\'s travels from 1948-1949.',
        images: [
          { src: "3A4_TentativeShedKeller.png", alt: 'A typed document outlines Helen\'s travels from 1948-1949.' }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `TENTATIVE ITINERARY OF HELEN KELLER'S VISIT
TO COUNTRIES OF THE ORIENT AND NEAR EAST (March ’48 - April '49)
Mar. 21 - Aug. 15 - Australia and New Zealand Leave San Francisco by plane Mar. 25 &, for Sydney, Australia. Guest of Hon. Mr. Justice Maxwell, President of the Royal Industrial Institute for the Blind, Sydney, Australia. August 15 Enroute to Japan via Manila or Singapore and Bangkok. Sept. 1 - Oct. 20 - Japan [underlined], where eleven cities will be visited - Tokyo, Sendai, Sapporo, Kanazawa, Nagoya, Osaka, Kyoto, Hiroshima, Fukuoka, Nagasaki, and Takamatsu. Arrange-, ments are in the hands of a nation-wide committee. (Takeo Iwahashi of the Lighthouse in Osaka, is chief correspondent).
Oct.
20 -Nov. 5 -
be visited.
Korea where at least 4 cities in S. Korea will [be visited] Arrangements in the hands of a National
Committee, consisting of Koreans, missionaries, government and military representatives. (R.C.Coen and [George Paik, correspondents).]
George Paik, correspondents).
Nov.-Dec.2S - China [underlined]
Tentative list of cities to be visited - Peiping, Tsinan, Tientsin, Hankow, Nanking, Shanghai, Soochow, Hangchow, Foochow, Amoy, Canton and Hongkong. National Committee now being set up in consultation with government representatives, National Agencies for the blind and the National Christian Council.
Dec. 28-Jan.4 - Brief stop-overs at Bangkok, Siam and Rangoon, Burma. enroute to India, (Singapore also a possibility of an invitation from the Lord Bishop of Singapore.)
Jan.4-Feb.10
India [underlined] and
list
Pakistan [underlined]
Tentative list of cities to be visited: Calcutta, Madras, Bangalore, Vellore, Travancore, Nagpur, New Delhi, Bombay, Lahore and Karachi. (Final itinerary to be agreed upon after consultation with Government representatives, the India Association for the Welfare of the Blind, the National Christian Council of India, the All-India Council
of Women and other groups.
Feb.10-Mar.25-Egypt., Iran, Iraq, Syria, Lebanon and Palestine. Itinerary to be worked out in consultation with Regional Councils, Government authorities, individuals, and local
city groups.
Mar,25-30 - Return to U.S.A [underlined], - stop-over at Istanbul, Turkey, if returning by plane.
GENERAL STATEMENT [underlined]
The tour, after leaving Japan, will be under the auspices of the JOHN MILTON SOCIETY for the Blind, of which Miss Helen Keller has been the honored President since 1928. This non-sectarian and inter-denominational Society is the officially appointed agency of more than 40 Protestant denominations in the United States and Canada. It exists primarily to provide Christian literature in Braille to the blind of the U.S., Canada and throughout the world.
Its monthly religious magazines for adults and children, together with its other occasional publications, reach more than 10,000 Braille readers residing in every state and in 26 foreign countries. Among these readers are more than 600 blind ministers and Sunday School teachers. Leave of absence for this world tour has been granted to Miss Keller by the American Foundation for the Blind of which she is Counsellor. It is hoped that a substantial part of the cost. of this tour will be provided by special gifts from interested friends.
The program to be set up in each city will include press interviews, public meetings, visits to schools and hospitals, official receptions and informal conferences with workers among the blind.
There will be at least 4 in the party - Miss Helen Keller, Miss Polly Thomson, her companion and secretary, Dr. Milton T. Stauffer, General Secretary of the John Milton Society for the Blind, Mrs. Stauffer and in addition, if possible, an experiences educator of the blind in this country whose knowledge and counsel on educational matters would be of special value in Worker's Conferences.`,
        guidedDescription: 'Two sheets of paper show staple holes in the top left corner. The text has been typed in black ink. There is light fading of the typing towards the top of each page, which may indicate that this was a printed copy of the original typed agenda.',
      },
      {
        id: "3A5",
        title: "Photograph of Helen Dancing with Italian Veteran, 1946",
        displayTitle: "Dancing with Italian Veteran",
        year: "1946",
        description: 'In 1946, Helen took a trip to postwar Europe alongside her companion Polly Thomson to advocate for wounded veterans and people with vision loss.  In this image, Helen dances with an Italian veteran at the Roman Institute for War Blind.',
        type: "photograph",
        alt: 'A black-and-white photograph shows Helen dancing with a blind man.',
        images: [
          { src: "3A5ItalyVet1.png", alt: 'A black-and-white photograph shows Helen dancing with a blind man.' },
          {
            src: "3A5ItalyVet2.png",
            alt: "Back of photograph of Helen Keller dancing with an Italian veteran",
            guidedDescription: 'On the back of the photograph, a purple-ink stamp from an Italian ministry appears in Italian. Below it, black type gives the photo\'s date, location, and a brief description, also in Italian. Overlaid typed text states that the photograph belongs to the Helen Keller Archives at the American Foundation for the Blind.',
          }
        ],
        guidedDescription: 'In this black-and-white photo, veteran in his wartime San Marco Marine jumper holds Helen\'s right hand in his left while Polly Thomson spells into it. His chest patch shows a winged lion with a sword on an open book. Smiling, he shows missing teeth. Civilians watch behind them.',
      },
      {
        id: "3A6",
        title: "Photograph with Golda Meir, 1952",
        displayTitle: "Photograph with Golda Meir",
        year: "1952",
        description: 'In the spring of 1952, a 72-year-old Helen traveled to Israel to meet with several Israeli leaders, including future Prime Minister of Israel, Golda Meir. Helen spent a total of two weeks in Israel on an international advocacy tour for people who are blind or deaf.',
        type: "photograph",
        alt: 'A black-and-white photograph shows Helen sitting with Israeli Prime Minister Golda Meir and others around a table.',
        images: [
          { src: "3A6Israel1.png", alt: 'A black-and-white photograph shows Helen sitting with Israeli Prime Minister Golda Meir and others around a table.' },
          {
            src: "3A6Israel2.png",
            alt: "Back of photograph of Helen Keller with Golda Meir",
            guidedDescription: 'Handwritten text at the top of the back of the photograph names Helen Keller, Polly Thomson, Golda Myerson, and Mrs. Zypora Sharett, 1952. Below it, a purple stamp in Hebrew and English reads "State of Israel, Government Press Division."',
          }
        ],
        guidedDescription: 'In this black-and-white photograph, Helen sits on a sofa beside Polly Thomson, placing her thumb on Polly\'s throat and fingers on her lips to "listen." Across a round coffee table sit Golda Meir and Zipporah Sharett, wife of Israel\'s second Prime Minister. Helen and Polly wear light dresses and hats.',
      },
      {
        id: "3A7",
        title: "Syria Travel Itinerary, 1952",
        displayTitle: "Syria Travel Itinerary",
        year: "1952",
        description: 'This travel itinerary details Helen travels to the Middle East in 1952, during which she spent 5 days in Syria to raise awareness for people who are blind or deaf and visit local communities.',
        type: "document",
        alt: 'A typed document with handwriting in blue and red ink outlines Helen\'s travel to Syria.',
        images: [
          { src: "3A7Syria1.png", alt: 'A typed document with handwriting in blue and red ink outlines Helen\'s travel to Syria.' }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `[Handwritten note in blue ink: Pages 1-6 - Egypt Pages 6-8 Lebanon Page 9 - Syria Pages 10-13 - Jordan (a grouping brace) all each country]
-9-
Helen Keller's Visit to Syria [circled in red ink] (Damascus)
from May 5, evening to May 9, morning. 1952
Tuesday, May 6.
11.00 a.m. Press conference at the Hotel with 19 journalists from Damascus, Amman and Jerusalem.
11.45 " Visit to Mr. Grand Parr, Public Affair Officer and to Mr. Donald Snock, Cultural Officer of the American Legation, Damascus.
3.30 p.m. Drive through the old city, shopping.
5.00 " Visit to Mr. Cavendish Cannon, Minister of U.S.A.
Wednesday May 7.
Rest in the morning.
3.15 p.m. Mrs. Abed, mother and daughter, pay a visit to Helen and Polly in the Hotel.
4.00 " Talk at the hall of the "Milk Distribution Center" of Mrs. Abed, where about 150 persons are present, mostly women. Helen asks these women:
1. to create a women's organisation for the Welfare of the Blind.
2. to take upon their hearts the necessity for opening a school and workshops for the Blind.
5.30 p.m. Reception at the U.S. - Residence. Farewell to MInister and Mrs. C.Cannon.
Thursday, May 8.
8.30 a.m. Visit to the Museum. (Director: Mr. Selim bey Adel Abdul Hak)
9.30 " Visit to the Palais Azem, old arabic architecture.
10.30 " Visit to the House of General Selo: Helen writes down her name in the "Golden Book of Syria".
11.30 " Dr. and Mrs. C Zurayk, President of the Syrian University, Damascus, together with Dr. Djemil Saliba, Dean of the Medical Faculty and Dr. A. Chahina, Dean of the Educational Faculty, pay a visit to Helen and Polly. Dr. Saliba translated into Arabic sections out of "The Story of my Life". It was printed by the Ministry of Education in "EL MOOLLEM EL ARABY", He had sent to Helen a specimen of all the books that have as content her life's story.
6.00 p.m. Lecture at the French-Arabic Lycee. [underlined] (Mr. Marc Manger, Director) About 600 persons were present and almost just as many stood outside, as they couldn't find place in the hall! Introduction by Dr. Taher Muradi, M.D. cancer specialist.
11•00 a.m.
11.45 M
3*30 p.m.
5.00 “
3.15 p.m.
4.00 H
5.30 p.m.
8.30 a.m.
9.30 M
10.30 **
11.30 H
6.00 p.m.
May 5, evening to May 9, morning. 1952
Taesday.May 6.
Press Conference at the Hotel with 19 journalists from
Damascus, Amman and Jerusalem.
Visit to Mr.Grand Parr, Public Affair Officer and to
Mr.Donald Snock, Cultural Officer of the American Legation,
Damascus.
Drive through the old city, shopping.
Visit to Mr.Cavendish Cannon, Minister of U.S.A.
Wednesday,May 7.
Rest in the morning.
Mrs.Abed, mother and daughter, pay a visit to Helen and Polly
in the Hotel.
Talk at the hall of the H Milk Distribution Center” of
Mrs.Abed, where about 150 persons are present, mostly women.
Helen asks these women:
1. to create a women’s organisation for the Welfare of the
2. to take upon their hearts the necessity for opening a
school and workshops for the Blind.
Reception at the U.S.- Residence. Parewell to Minister and
Mrs.C.Cannon.
Thursday.May 8.
Visit to the Museum. (Director: Mr.Selim bey Adel Abdul Hak)
Visit to the Palais Azem, old arabic architecture.
Visit to the House of General Selo: Helen writes down her
name in the H Golden Book of Syria”.
Dr.and Mrs.C.Zurayk, President of the Syrian University,
Damascus, together with Dr.Djemil Saliba, Dean of the Medical
Faculty and Dr.A.Chahina, Dean of the Educational Faculty,
pay a visit to Helen and Polly. Dr.Saliba translated into
Arabic selections out of ’’The Story of my Life”. It was prin-
ted by the Ministry of Education in ”EL MOOLLEM EL ARABY”, He
had sent to Helen a specimen of all the books that have as
content her life’s story.
Lecture at the French-Arabic Lycde. (Mr.Marc Manger,Director)
About 600 persons were present and almost just as many stood
outside, as they couldn’t find place in the hallI Introduction
by Dr. Taher Muradi, M.D. cancer specialist.
11.00 a.m.
11.45 ”
3*30 p.m.
5.00 ”
3.15 p.m.
4.00 ”
5.30 p.m.
8.30 a.m.
9.30 ”
10.30 ”
11.30 ”
6.00 p.m.`,
        guidedDescription: 'A typed travel itinerary lists times in the left column and underlined dates heading the right. Top handwriting notes these days fell between trips to Egypt, Lebanon, and Jordan. A blue-ink table of contents is at top left. Syria is circled in red there and in the heading.',
      }
    ]
  },

  work: {
    id: "work",
    number: 4,
    label: "Work",
    descriptionMode: DESCRIPTION_MODE_SECTIONS,
    quote: "\u201CIf we do not like our work, and do not try to get happiness out of it, we are a menace to our profession as well as to ourselves.\u201D",
    description: "No less a fixture in Vaudeville than in the Cambridge School for Young Ladies, Helen had an extremely diverse life in both education and employment. Her work in literary circles, Radcliffe College, and even in Hollywood no doubt contributed to her incredible ability to prevail in the most challenging of endeavors.",
    iconAlt: "A Corona typewriter is layered over documents and a black and white photo of Helen with Charlie Chaplin.",
    artifacts: [
      {
        id: "4A1",
        title: "Corona Portable Typewriter",
        displayTitle: "Corona Portable Typewriter",
        year: "1938",
        description: 'Helen took her Corona travel typewriter everywhere with her. People would ask her to type out quotations and sign her name for them. What adventures might Helen have taken this on, and what thoughts might have she communicated with the world through its keys?',
        type: "object",
        alt: 'A photograph shows Helen\'s shiny black Corona travel typewriter.',
        images: [
          { src: "4A1Typewriter1.png", alt: 'A photograph shows Helen\'s shiny black Corona travel typewriter.' },
          {
            src: "4A1Typewriter2.png",
            alt: "Close-up of Helen Keller\u2019s Corona portable typewriter keyboard",
            guidedDescription: 'A close-up view of the traveling typewriter keyboard. A worn gold "CORONA" label marks the front. A QWERTY keyboard, margin and tab sets on the back, and a label inside the lid complete it.',
          }
        ],
        guidedDescription: 'A gloss black Corona Silent portable typewriter with a streamlined body and nickel-plated hardware, including two spring latches on the front. A gold "CORONA" label marks the front. A QWERTY keyboard, margin and tab sets on the back, and a label inside the lid complete it.',
      },
      {
        id: "4A2",
        title: "Evaluating a Braille Typewriter, 1954",
        displayTitle: "Evaluating a Braille Typewriter",
        year: "1954",
        description: 'In this photograph, Helen evaluates an electro braillewriter while working at American Foundation for the Blind. In the photo with her are AFB Director Robert Barnett, Marta Sobieski, Peter Salmon from the Industrial Home for the Blind, Polly Thomson and Gregor Ziemer. A painting of Helen by Albert H. Munsell hangs in the background.',
        type: "photograph",
        alt: 'A black-and-white photograph shows a crowd of people around Helen while she uses an electro braillewriter.',
        images: [
          { src: "4A2AFB1.png", alt: 'A black-and-white photograph shows a crowd of people around Helen while she uses an electro braillewriter.' },
          { src: "4A2AFB2.png", alt: "Back of photograph of Helen Keller evaluating a braille typewriter, 1954" }
        ],
        guidedDescription: 'In this black-and-white photograph, Helen evaluates an electro braillewriter at the American Foundation for the Blind. AFB Director Robert Barnett, Marta Sobieski, Peter Salmon, Polly Thomson, and Gregor Ziemer appear with her. A painting of Helen by Albert H. Munsell hangs behind them.',
      },
      {
        id: "4A3",
        title: "Helen\u2019s Vaudeville Script",
        displayTitle: "Helen\u2019s Vaudeville Script",
        year: "1920\u20131924",
        description: 'Between her work as an author and employment at the American Foundation for the Blind, Helen and her companions worked the Vaudeville circuit. While it wasn\'t steady work, Helen enjoyed it. This script is from a show she performed with her lifelong instructor and friend, Anne Sullivan.',
        type: "document",
        alt: 'A yellowed, torn sheet of paper shows the first page of Helen\'s typed vaudeville script.',
        images: [
          { src: "4A3Vaudeville1.png", alt: "Page 1 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville2.png", alt: "Page 2 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville3.png", alt: "Page 3 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville4.png", alt: "Page 4 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville5.png", alt: "Page 5 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville6.png", alt: "Page 6 of Helen Keller\u2019s Vaudeville script" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'A typed vaudeville script for a sketch featuring Helen and her teacher  Anne Sullivan is printed on yellow paper. Handwritten notes mark the pages, which show folds, tears, and tape repairs.',
      },
      {
        id: "4A4",
        title: "Photograph with Charlie Chaplin, 1918",
        displayTitle: "Photograph with Charlie Chaplin",
        year: "1918",
        description: 'Helen and companions Polly Thomson and Anne Sullivan took this photograph with Charlie Chaplin in a Hollywood film studio while he was filming "Sunnyside.” Helen is said to have taught him the tactile sign-language alphabet she used to communicate.',
        type: "photograph",
        alt: 'A black-and-white photograph shows Helen on a movie set next to Charlie Chaplin.',
        images: [
          { src: "4A4Chaplin1.png", alt: 'A black-and-white photograph shows Helen on a movie set next to Charlie Chaplin.' },
          { src: "4A4Chaplin2.png", alt: "Back of photograph of Helen Keller with Charlie Chaplin, 1918" }
        ],
        guidedDescription: 'In this black-and-white photograph, Polly Thomson, Anne Sullivan Macy, Helen Keller, and Charlie Chaplin sit left to right in a Hollywood film studio, with a camera and set behind them. The women wear matching jackets, long skirts, and hats. Helen touches Macy\'s lips and Chaplin\'s shoulder while gazing downward.',
      },
      {
        id: "4A5",
        title: "Letter of Admission to Radcliffe College, 1899",
        displayTitle: "Admission to Radcliffe College",
        year: "1899",
        description: 'Radcliffe was originally a women’s college that was administered by Harvard before women were admitted there, some 50 years after Helen attended. Helen became the first deafblind person in the United States to earn a college degree after she was admitted to Radcliffe College in 1899.',
        type: "document",
        alt: 'A Radcliffe College Certificate of Admission shows Helen\'s admission to the institution in 1899.',
        images: [
          { src: "4A5Radcliffe.png", alt: 'A Radcliffe College Certificate of Admission shows Helen\'s admission to the institution in 1899.' }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription: 'A letter of admission from Radcliffe College, dated Cambridge, July 4, 1899, states that Helen Adams Keller is admitted to the freshman class. A round seal at the top shows a divided crest with stars and stripes. Agnes Irwin, Dean, signs it, and a handwritten note records Helen\'s credit in Advanced Latin.',
      },
      {
        id: "4A6",
        title: "Perkins School Letter, 1886",
        displayTitle: "Perkins School Letter",
        year: "1886",
        description: 'In this 1886 letter, Perkins School Director Michael Anagnos asked Annie Sullivan if she was interested in “a position in the family of Mr. Keller as governess of his little deaf-mute and blind daughter.”  Helen is not even mentioned by name, a stark contrast to the closeness shared between the pair once they were together.',
        type: "document",
        alt: 'A handwritten letter on Perkins School letterhead asks Anne Sullivan to work with Helen and her family.',
        images: [
          { src: "4A6Perkins.png", alt: 'A handwritten letter on Perkins School letterhead asks Anne Sullivan to work with Helen and her family.' }
        ],
        guidedDescription: 'A handwritten letter to Anne Sullivan from Anagnos, asking her to become Helen\'s assistant, is written on Perkins Institution for the Blind stationery. Red calligraphy-style printing at the top gives institutional and date information. Ornate black cursive fills the entire page, following light blue printed lines.',
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy"
      }
    ]
  }
};

export const themeOrder = ["change", "together", "adventure", "work"];

/** Placeholder until the instructional video has a real transcript. */
export const instructionalVideoTranscript =
  "placeholder text for instructional video. Description of controls";

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
 * Theme circle follow-up after name + button.
 * HomeScene speaks this via delayed live announce (not aria-describedby).
 */
export function getThemeCarouselDescription(themeId) {
  const iconAlt = themes[themeId]?.iconAlt;
  if (!iconAlt) return THEME_SELECT_CTA;
  const alt = iconAlt.replace(/\.\s*$/, "");
  return `Image: ${alt}. ${THEME_SELECT_CTA}`;
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

/** Description after role "button". Leading " , " nudges a brief pause. */
export function getArtifactCircleDescription(artifact) {
  const alt = getArtifactAltText(artifact).replace(/\.\s*$/, "");
  return ` , ${alt}. ${ARTIFACT_SELECT_CTA}`;
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

