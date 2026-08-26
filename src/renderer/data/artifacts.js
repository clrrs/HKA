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
    screenReaderBlurb: "Helen Keller was a lifelong advocate for voting, labor, economic rights, and disability rights.",
    artifacts: [
      {
        id: "1A1",
        title: "Video of Korean War Veteran Visit, 1953",
        displayTitle: "Korean War Veteran Visit",
        year: "1953",
        description: "Helen once stated that the work that she did with veterans who had been blinded was the crowning experience of her life. Helen worked with wounded veterans from the First World War through the Korean War, as shown in this black-and-white film from 1953, in which Helen and Polly Thomson visit hospitalized veterans.",
        type: "video",
        videoSrc: "1A1VeteranVid.mp4",
        posterSrc: "1A1VeteranVid_frame.png",
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
        guidedDescription:
          "Men sit in two hospital beds with simple metal frames while Helen speaks, shakes one man\u2019s hand, and touches the other\u2019s face. Helen then embraces the right hand of a young, bedridden man whose other hand is being held by young woman at his bedside. Helen is briefly shown speaking to a young man with short dark hair and dark skin. Finally, Helen stands between two veterans in beds as three other veterans in wheelchairs gather around them."
      },
      {
        id: "1A2",
        title: "IWW Conspiracy Speech, 1918",
        displayTitle: "IWW Conspiracy Speech",
        year: "1918",
        description: "In one of her most passionate political writings, Helen\u2019s 1918 speech defending The Industrial Workers of the World, a labor union and \u201Cmovement of revolt,\u201D states that opponents of the movement did everything from labeling them as \u201Cdangerous foreigners\u201D to accusing them of kidnapping and murder.",
        type: "document",
        images: [
          { src: "1A2IWW1.jpeg", alt: "Page 1 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW2.jpeg", alt: "Page 2 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW3.jpeg", alt: "Page 3 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW4.jpeg", alt: "Page 4 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" },
          { src: "1A2IWW5.jpeg", alt: "Page 5 of Helen Keller\u2019s IWW Conspiracy Speech, 1918" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Five pieces of paper, slightly darkened with age, show Helen\u2019s typewritten speech. There is a light crease running vertically down the pages where they were formerly folded together. Several staple holes are in the left corners. In pencil, several minor corrections have been made throughout."
      },
      {
        id: "1A3",
        title: "Women\u2019s Suffrage Speech, 1920",
        displayTitle: "Women\u2019s Suffrage Speech",
        year: "1920",
        description: "Helen argues in this 1920 speech about women\u2019s suffrage that women\u2019s right to vote, along with all other rights, are only earned when we are strong enough to claim them for ourselves: \u201CToday women are asserting their rights, tomorrow nobody will be foolhardy enough to question them.\u201D",
        type: "document",
        images: [
          { src: "1A3Suffrage1.jpeg", alt: "Page 1 of Helen Keller\u2019s Women\u2019s Suffrage Speech, 1920" },
          { src: "1A3Suffrage2.jpeg", alt: "Page 2 of Helen Keller\u2019s Women\u2019s Suffrage Speech, 1920" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Two thin, tattered sheets of paper show a speech with the title underlined in red pencil. Three horizontal creases show where the pages were folded. Several minor corrections have been made in pen and dark grease pencil throughout. Very light notes have been scribbled on the top of the first page in pencil but are not legible. Cataloging notes are neatly printed in pencil near the top right corner."
      },
      {
        id: "1A4",
        title: "Letter to the ACLU, 1919",
        displayTitle: "Letter to the ACLU",
        year: "1919",
        description: "In this correspondence between Helen and The National Civil Liberties Bureau, now known as the American Civil Liberties Union, and the National Association for the Advancement of Colored People, Helen shows her early support for the founding of both organizations and their missions.",
        type: "document",
        images: [
          { src: "1A4ACLU1.jpeg", alt: "Page 1 of Helen Keller\u2019s letter to the ACLU, 1919" },
          { src: "1A4ACLU2.jpeg", alt: "Page 2 of Helen Keller\u2019s letter to the ACLU, 1919" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Yellowed letterhead has the name, address, officers, and directing committee of the National Civil Liberties Bureau printed on the top of the first page in blue ink. Staple holes remain in the top left corner, and two faint horizontal creases show where the letter had been folded. The shadow of some erased notes are near the top right corner, and four signatures in cursive ink close the letter."
      },
      {
        id: "1A5",
        title: "Letter to the NAACP, 1916",
        displayTitle: "Letter to the NAACP",
        year: "1916",
        description: "Helen wrote to Mr. Oswald Garrisen Villard, then-Vice President of the National Association for the Advancement of Colored People, in 1916 to express her solidarity with their movement. In this letter, she says, \u201CIt should bring the blush of shame to the face of every true American to know that ten of millions of his countrymen are denied the equal protection of the laws.\u201D",
        type: "document",
        images: [
          { src: "1A5NAACP1.jpeg", alt: "Page 1 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP2.jpeg", alt: "Page 2 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP3.jpeg", alt: "Page 3 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP4.jpeg", alt: "Page 4 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP5.jpeg", alt: "Page 5 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP6.jpeg", alt: "Page 6 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP7.jpeg", alt: "Page 7 of Helen Keller\u2019s letter to the NAACP, 1916" },
          { src: "1A5NAACP8.jpeg", alt: "Page 8 of Helen Keller\u2019s letter to the NAACP, 1916" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Helen's first letter is typed on four pages of letterhead showing the bust of a winged dragon above a scroll reading \"The Waldo\" with proprietary information printed below. Her second is typed on blank paper. Both show staple holes, tape markings, and handwritten corrections and archival notes. The final document is a quarter-length receipt printed in traditional script. Blank lines have the date, Helen's name, and the amount of her donation typed on them, with a treasurer's signature on the final blank."
      },
      {
        id: "1A6",
        title: "Blindness Prevention Article, 1914",
        displayTitle: "Blindness Prevention Article",
        year: "1914",
        description: "Published in \u201CThe Nurse\u201D in 1914, Helen\u2019s article candidly discusses women who are forced into prostitution by poverty, and children who were born blind due to sexually transmitted infections. She also laments the modesty in language that prevents discussion, and ultimately prevention, of the problem.",
        type: "document",
        images: [
          { src: "1A6PrevBlind1.jpeg", alt: "Page 1 of Helen Keller\u2019s Blindness Prevention Article, 1914" },
          { src: "1A6PrevBlind2.jpeg", alt: "Page 2 of Helen Keller\u2019s Blindness Prevention Article, 1914" },
          { src: "1A6PrevBlind3.jpeg", alt: "Page 3 of Helen Keller\u2019s Blindness Prevention Article, 1914" }
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
    screenReaderBlurb: "Helen Keller\u2019s growth and accomplishments grew from friendships and collaboration across society and the world.",
    artifacts: [
      {
        id: "2A1",
        title: "Letter from Eugene Debs, 1919",
        displayTitle: "Letter from Eugene Debs",
        year: "1919",
        description: "Eugene Debs, a former socialist presidential candidate and Southern Indiana native, wrote this letter to Helen while serving six months on federal charges after President Cleveland used the US Army to break the \u201CPullman Strike,\u201D led by Debs through the American Railway Union.",
        type: "document",
        images: [
          { src: "2A1Debs1.jpeg", alt: "Page 1 of letter from Eugene Debs to Helen Keller, 1919" },
          { src: "2A1Debs2.jpeg", alt: "Page 2 of letter from Eugene Debs to Helen Keller, 1919" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Two-sided letterhead from the West Virginia Penitentiary is headed by blanks for recipient and sender information at the top. A floral design, address, and date blank are just below. The heading on the reverse shows 4 paragraphs of correspondence instructions for relatives and friends from the warden in small print. The front is lined for handwriting in light blue, and the rear is not. Debbs' inked cursive covers both sides. The paper shows two horizontal creases, one vertical, and a faint, upside-down watermark that says \"Empire Bonded USA.\""
      },
      {
        id: "2A2",
        title: "Letter to General MacArthur, 1949",
        displayTitle: "Letter to General MacArthur",
        year: "1949",
        description: "Although Helen and General MacArthur, a top US general during WWII, could not have been more dissimilar in their career paths or politics, the two worked closely and successfully during her post-war trip to Occupied Japan. In this warm and cordial letter, Helen thanks him for bringing international attention to the needs of blind and disabled people in the post-WWII-ravaged nation.",
        type: "document",
        images: [
          { src: "2A2MacA1.jpeg", alt: "Page 1 of Helen Keller\u2019s letter to General MacArthur, 1949" },
          { src: "2A2MacA2.jpeg", alt: "Page 2 of Helen Keller\u2019s letter to General MacArthur, 1949" },
          { src: "2A2MacA3.jpeg", alt: "Page 3 of Helen Keller\u2019s letter to General MacArthur, 1949" },
          { src: "2A2MacA4.jpeg", alt: "Page 4 of Helen Keller\u2019s letter to General MacArthur, 1949" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Two letters, each one double sided sheet of paper, showing typewritten messages from Helen to General Douglas MacArthur. Each sheet shows two vertical creases and one horizontal across the center. Minor corrections in pen and pencil are throughout, and staple holes remain in the top left corner."
      },
      {
        id: "2A3",
        title: "Handwritten Letter from Mark Twain, 1905",
        displayTitle: "Letter from Mark Twain",
        year: "1905",
        description: "Despite a 40-year age difference, Helen Keller and Mark Twain maintained a lengthy friendship. In this handwritten letter of thanks from Mark Twain on his 70th birthday, he adds a very personal note to Helen on the back, signing off with both \u201Cloves\u201D, and his real name, Samuel L. Clemens.",
        type: "document",
        images: [
          { src: "2A3Twain1.jpeg", alt: "Front of handwritten letter from Mark Twain to Helen Keller, 1905" },
          { src: "2A3Twain2.jpeg", alt: "Back of handwritten letter from Mark Twain to Helen Keller, 1905" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "This two-sided letter first appears to be handwritten on both sides. But the signature of \"Mark Twain\" on the front is in a darker ink, along with the phrase \"over.\" There is a second message of a more personal tone on the rear that is also in the darker ink, with the signature of \"S.L. Clemons.\" This difference in ink, along with the tail of a \"Y\" being cut off towards the bottom of the front page, may suggest that the thank-you message on the front was pre-printed."
      },
      {
        id: "2A4",
        title: "Student Christmas Letters to Helen, 1934",
        displayTitle: "Student Christmas Letters",
        year: "1934",
        description: "After reading about the talking book program at the American Foundation for the Blind, third- and fourth-grade students from Wrangell, Alaska wrote Helen about publishing a small pamphlet of their own writing. They sold each copy for 2 cents and donated the money to the American Foundation for the Blind to show the spirit of giving during the holidays. Their daily lives were also detailed as only students of that age could.",
        type: "document",
        images: [
          { src: "2A4Student1.jpeg", alt: "Student Christmas letter to Helen Keller, page 1" },
          { src: "2A4Student2.jpeg", alt: "Student Christmas letter to Helen Keller, page 2" },
          { src: "2A4Student3.jpeg", alt: "Student Christmas letter to Helen Keller, page 3" },
          { src: "2A4Student4.jpeg", alt: "Student Christmas letter to Helen Keller, page 4" },
          { src: "2A4Student5.jpeg", alt: "Student Christmas letter to Helen Keller, page 5" },
          { src: "2A4Student6.jpeg", alt: "Student Christmas letter to Helen Keller, page 6" },
          { src: "2A4Student7.jpeg", alt: "Student Christmas letter to Helen Keller, page 7" },
          { src: "2A4Student8.jpeg", alt: "Student Christmas letter to Helen Keller, page 8" },
          { src: "2A4Student9.jpeg", alt: "Student Christmas letter to Helen Keller, page 9" },
          { src: "2A4Student10.jpeg", alt: "Student Christmas letter to Helen Keller, page 10" },
          { src: "2A4Student11.jpeg", alt: "Student Christmas letter to Helen Keller, page 11" },
          { src: "2A4Student12.jpeg", alt: "Student Christmas letter to Helen Keller, page 12" },
          { src: "2A4Student13.jpeg", alt: "Student Christmas letter to Helen Keller, page 13" },
          { src: "2A4Student14.jpeg", alt: "Student Christmas letter to Helen Keller, page 14" },
          { src: "2A4Student15.jpeg", alt: "Student Christmas letter to Helen Keller, page 15" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescriptionMode: GUIDED_DESCRIPTION_MODE_LETTERS,
        letterSections: [
          { imageIndices: [0] },
          { imageIndices: [1] },
          { imageIndices: [2] },
          { imageIndices: [3] },
          { imageIndices: [4] },
          { imageIndices: [5] },
          { imageIndices: [6] },
          { imageIndices: [7] },
          { imageIndices: [8] },
          { imageIndices: [9] },
          { imageIndices: [10] },
          { imageIndices: [11] },
          { imageIndices: [12] },
          { imageIndices: [13] },
          { imageIndices: [14] },
        ],
      },
      {
        id: "2A5",
        title: "Arcan Ridge Door Knocker",
        displayTitle: "Arcan Ridge Door Knocker",
        year: "1947",
        description: "This knocker hung on the door of Helen\u2019s Easton home on Arcan Ridge from 1946 to 1968. What important visitors may have used it over those decades, visiting Helen with important work or exuberant celebrations?",
        type: "object",
        images: [
          { src: "2A5DoorKnock.jpeg", alt: "Door knocker from Helen Keller\u2019s Arcan Ridge home" }
        ],
        guidedDescription:
          "A cast brass door knocker shaped like an urn has finials on its top and bottom. A flat faceplate near the middle of the urn is engraved with \"HELEN KELLER.\" A swinging, horseshoe-shaped striker hangs from the sides of the faceplate."
      },
      {
        id: "2A6",
        title: "Letter Requesting FDR Autograph, 1929",
        displayTitle: "Letter Requesting FDR Autograph",
        year: "1929",
        description: "Having received a typewritten letter from Gov. Franklin D. Roosevelt declining membership in the American Foundation for the Blind, Helen replied on the reverse with a handwritten note requesting his autograph. The only autograph she had ever asked for, she wanted to make her request before he became the President of the United States. Four years later, he was elected to that position.",
        type: "document",
        images: [
          { src: "2A6FDR1.jpeg", alt: "Page 1 of Helen Keller\u2019s letter requesting FDR\u2019s autograph, 1929" },
          { src: "2A6FDR2.jpeg", alt: "Page 2 of Helen Keller\u2019s letter requesting FDR\u2019s autograph, 1929" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Letterhead shows a gold seal of the state of New York, with an eagle atop a shield with a rising sun and two sailing ships near the shore. The shield is flanked by two robed women: one with a staff, the other blindfolded with a sword and scale. \"Excelsior\" is printed on the scroll below it. Roosevelt's office information is printed in blue ink. His message is typed, with an ink signature and one edit. Helen's message is written in pencil on the rear with her distinctive block lettering."
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
    screenReaderBlurb: "Helen Keller traveled to 39 countries and even piloted a plane, inspiring people everywhere she went.",
    artifacts: [
      {
        id: "3A1",
        title: "Video of Biplane Flight, 1919",
        displayTitle: "Helen Keller Takes a Ride in an Airplane",
        year: "1919",
        description:
          "The 1919 silent movie “Deliverance” tells the story of Helen Keller’s life in three acts: Childhood, Maidenhood, and Womanhood. Helen plays herself in this movie. In this clip, she rides in the open cockpit of a biplane.",
        type: "video",
        videoSrc: "3A1Biplane.mp4",
        posterSrc: "3A1Biplane_frame.png",
        images: [],
        transcriptTitle: "Transcript",
        transcriptText: `Female narrator: It showed her first airplane ride. A daring feat at that time.
Male audio description: In old, black and white footage, elegantly-dressed women help tidy Helen’s leather coat.
[engine rumbles]
Male audio description: She also wears a tight leather helmet on her head. An airplane drives across a field and takes off into the air. On the ground, Helen’s friends watch excitedly as the plane flies high in the sky.
[uplifting orchestral music]
Male audio description: Helen rides in the front and a pilot steers in the back of the two-seater aircraft. Wind flies over their heads in the open, roofless plane. The airplane safely lands on the flat, grassy ground. Dozens of people rush to the parked plane and assist Helen out of the sunken seat. Helen smiles broadly and hugs her teacher Anne Sullivan Macy.`,
        guidedDescription:
          "In grainy, black-and-white film, Anne Sullivan and Polly Thomson, Helen's teacher and assistant, respectively, help Helen gear up to board the biplane. Helen’s brother Phillips Brooks Keller, a US Army World War I aviator, is wearing his military uniform as he watches alongside Helen’s mother. Anne and Polly help Helen board the open front cockpit of the biplane, while the pilot sits in the rear cockpit. Groundcrew spins the propeller to start the engine, and the biplane makes a wobbly takeoff from a dusty field. The biplane is shown high in the sky, followed by a shot of Helen's friends and family watching from the ground. The plane lands smoothly on the grass, and Helen is assisted out of the biplane and gives Anne a hug."
      },
      {
        id: "3A2",
        title: "Japanese Luncheon Set, 1948",
        displayTitle: "Japanese Luncheon Set",
        year: "1948",
        description:
          "Kazuo Honma, a blind Japanese activist, educator, and founder of the National Library for the Blind in Japan, gifted Helen a black lacquer New Year's luncheon set in 1948. Two photos show the luncheon set in detail.",
        type: "object",
        images: [
          {
            src: "3A2Lunch1.jpeg",
            alt: "Black lacquer Japanese luncheon set with gold decorative symbols, shown from the front view displaying the carrying stand with brass handle"
          },
          {
            src: "3A2Lunch2.jpeg",
            alt: "Close-up view of the Japanese luncheon set showing the intricate carved abalone inlays and gold detailing on the black lacquer surface",
            guidedDescription:
              "The luncheon set fits neatly back together, with all items inside the carrying stand with the brass top."
          }
        ],
        
        guidedDescription:
          "All items in the luncheon set feature gold decorations showing plants, symbols, and designs. Golden and carved abalone inlays show birds facing each other in a triangular pattern. An outer carrying stand with brass top handle holds six drawers, each with a red interior. One medium sized tray, five smaller trays, a removable bottle holder, and a pair of pewter cylinder bottles all fit into the carrying stand."
      },
      {
        id: "3A3",
        title: "Photograph with Bantu Chief, 1951",
        displayTitle: "Photograph with Bantu Chief",
        year: "1951",
        description:
          "Helen traveled to East London, South Africa to open the Duncan Village Community Center for Bantu People on April 11, 1951. Like other segregated locations in other South African cities, Duncan Village demonstrated the extreme inequality between black and white residents under the country’s system of apartheid.",
        type: "photograph",
        images: [
          { src: "3A3Bantu1.jpeg", alt: "Helen Keller meeting with a Bantu Chief in 1951" },
          {
            src: "3A3Bantu2.jpeg",
            alt: "Another view of Helen Keller's meeting with the Bantu Chief",
            guidedDescription:
              "The back of the photo has handwritten text in pencil that describes the image. Additional information about the size of the photograph is written in red ink. A rectangular stamp says “Wyndon Photos,” where the image was printed."
          }
        ],
          transcriptTitle: "Transcript",
          transcriptText: `Taken outdoors in the sunshine during Helen Keller's visit to South Africa. Photographed standing left to right are a Bantu Chieftan, Keller, the Bantu Chieftan's wife and Polly Thomson. Keller was there to open the Duncan Village Community Center for Bantu People, East London, Cape Province. They are standing in front of a wall. Keller has her hand on the tip of the sword the chieftan is holding. The Bantu couple are wearing traditional beaded garments and head pieces. Keller and Thomson wear hats and identical long sleeve dresses with horizontal stripes. [Typed caption: Helen Keller opened the Duncan Village Community Center for the Bantu people, East London, Cape Province. Her picture was taken with a tribal chief and his wife.]

[Stamped: "WYNDON PHOTOS" S.A.N.L.A.M. BLDGS., FOR REPRINT QUOTE (followed by a blank line) EAST LONDON. PHONE 2633]

[Handwritten note, top left corner: "Amer Fnd fr Blind" written above "2-5+7 (illegible)"]
[Handwritten note, top center: "Helen Keller opened the Community Center for Bantu people. East London, Cape Province. Her picture was taken with a tribal chieftan and his wife"] [Handwritten note in left margin: "Chief and Wife (ineligible) April"] [Handwritten center note in red: "14 1/2 Picas" with arrows marking the dimension] [Handwritten center note in blue: "R3288"] [Handwritten center note: Please return to American Foundation] [Handwritten note: HK07.01.B058.F07.001] [Handwritten lower center note in red: "(ineligible) BP - 4482"] [Handwritten note in bottom right corner: "33.3"]`,
        guidedDescription:
          "In this black-and-white photograph, Helen and her assistant Polly Thomson pose with a Bantu Chieftain and his wife. The chief wears a collar of beaded necklaces, beaded belts across his waist and chest, and bands around his shoulders and upper arms. The chief holds a spear while Helen's hand feels the spearhead. The chief’s wife wears similar belts over a light-colored dress, a large cloth hat, and has light-colored dots of paint on her forehead, chin, and cheeks. She holds textiles and a cloth bag. Helen and Polly both wear dresses textured with horizontal stripes, belts at the waist, broaches on their left chests, pearl necklaces, and small hats. The photo is glued to a white board with type and handwritten notes, and yellowed glue is showing near the bottom."
      },
      {
        id: "3A4",
        title: "Global Travel Schedule, 1948-49",
        displayTitle: "Global Travel Schedule",
        year: "1948\u201349",
        description:
          "This travel itinerary details Helen’s travels from March of 1948 to April 1949, when she embarked on a global journey including visits to Australia, Korea, China, Thailand, India, Syria, and more, to meet with officials about the welfare of blind people in their respective countries.",
        type: "document",
        images: [
          { src: "3A4_TentativeShedKeller.jpeg", alt: "Helen Keller's global travel schedule from 1948-49" }
        ],
        transcriptTitle:
          'Transcript',
        transcriptText: `TENTATIVE ITINERARY OF HELEN KELLER'S VISIT

TO COUNTRIES OF THE ORIENT AND NEAR EAST (March \u201948 - April '49)

Mar. 21 - Aug. 15 - Australia and New Zealand Leave San Francisco by plane Mar. 25 &, for Sydney, Australia. Guest of Hon. Mr. Justice Maxwell, President of the Royal Industrial Institute for the Blind, Sydney, Australia. August 15 Enroute to Japan via Manila or Singapore and Bangkok.

Sept. 1 - Oct. 20 - Japan [underlined], where eleven cities will be visited - Tokyo, Sendai, Sapporo, Kanazawa, Nagoya, Osaka, Kyoto, Hiroshima, Fukuoka, Nagasaki, and Takamatsu. Arrange-, ments are in the hands of a nation-wide committee. (Takeo Iwahashi of the Lighthouse in Osaka, is chief correspondent).

Oct. 20 -Nov. 5 - Korea where at least 4 cities in S. Korea will [be visited] Arrangements in the hands of a National Committee, consisting of Koreans, missionaries, government and military representatives. (R.C.Coen and [George Paik, correspondents).]

Nov.-Dec.2S - China [underlined]

Tentative list of cities to be visited - Peiping, Tsinan, Tientsin, Hankow, Nanking, Shanghai, Soochow, Hangchow, Foochow, Amoy, Canton and Hongkong. National Committee now being set up in consultation with government representatives, National Agencies for the blind and the National Christian Council.

Dec. 28-Jan.4 - Brief stop-overs at Bangkok, Siam and Rangoon, Burma. enroute to India, (Singapore also a possibility of an invitation from the Lord Bishop of Singapore.)

Jan.4-Feb.10 India [underlined] and Pakistan [underlined]

Tentative list of cities to be visited: Calcutta, Madras, Bangalore, Vellore, Travancore, Nagpur, New Delhi, Bombay, Lahore and Karachi. (Final itinerary to be agreed upon after consultation with Government representatives, the India Association for the Welfare of the Blind, the National Christian Council of India, the All-India Council of Women and other groups.

Feb.10-Mar.25-Egypt., Iran, Iraq, Syria, Lebanon and Palestine. Itinerary to be worked out in consultation with Regional Councils, Government authorities, individuals, and local city groups.

Mar,25-30 - Return to U.S.A [underlined], - stop-over at Istanbul, Turkey, if returning by plane.

GENERAL STATEMENT [underlined]

The tour, after leaving Japan, will be under the auspices of the JOHN MILTON SOCIETY for the Blind, of which Miss Helen Keller has been the honored President since 1928. This non-sectarian and inter-denominational Society is the officially appointed agency of more than 40 Protestant denominations in the United States and Canada. It exists primarily to provide Christian literature in Braille to the blind of the U.S., Canada and throughout the world.

Its monthly religious magazines for adults and children, together with its other occasional publications, reach more than 10,000 Braille readers residing in every state and in 26 foreign countries. Among these readers are more than 600 blind ministers and Sunday School teachers. Leave of absence for this world tour has been granted to Miss Keller by the American Foundation for the Blind of which she is Counsellor. It is hoped that a substantial part of the cost. of this tour will be provided by special gifts from interested friends.

The program to be set up in each city will include press interviews, public meetings, visits to schools and hospitals, official receptions and informal conferences with workers among the blind.

There will be at least 4 in the party - Miss Helen Keller, Miss Polly Thomson, her companion and secretary, Dr. Milton T. Stauffer, General Secretary of the John Milton Society for the Blind, Mrs. Stauffer and in addition, if possible, an experiences educator of the blind in this country whose knowledge and counsel on educational matters would be of special value in Worker's Conferences.`,
        guidedDescription:
          "Two sheets of paper show staple holes and the indentation of a triangular paper clip in the top left corner, but are otherwise in excellent condition. The text has been typed in black ink. There is light fading of the typing towards the top of each page, which may show that this was a printed copy of the original typed agenda."
      },
      {
        id: "3A5",
        title: "Photograph of Helen Dancing with Italian Veteran, 1946",
        displayTitle: "Dancing with Italian Veteran",
        year: "1946",
        description:
          "In this black-and-white photograph, Helen dances with an Italian veteran at the Roman Institute for War Blind during her 1946 postwar trip for the American Foundation for Overseas Blind.",
        type: "photograph",
        images: [
          { src: "3A5ItalyVet1.jpeg", alt: "Helen Keller dancing with an Italian veteran in 1946" },
          {
            src: "3A5ItalyVet2.jpeg",
            alt: "Another view of Helen Keller with the Italian veteran",
            guidedDescription:
              "The back of the photograph shows a purple-ink stamp of an Italian Ministry. Type in black in features the photograph’s date and location and a brief description of the photograph’s contents."
          }
        ],
        guidedDescription:
          "The veteran is wearing his wartime San Marco Marine uniform jumper with an insignia patch on his left chest, which shows a winged lion with sword standing on an open book. Polly Thomson spells into Helen's right hand while it is being held by the veteran's left. Several people in civilian clothes watch in the background.  The smile on the face of the veteran shows missing teeth, possibly a result of the wounds that blinded him."
      },
      {
        id: "3A6",
        title: "Photograph with Golda Meir, 1952",
        displayTitle: "Photograph with Golda Meir",
        year: "1952",
        description:
          "In the spring of 1952, a 72-year-old Helen met with future Prime Minister of Israel, Golda Meir. Helen spent a total of two weeks in Israel on an international advocacy tour for people who are blind or deaf.",
        type: "photograph",
        images: [
          { src: "3A6Israel1.jpeg", alt: "Helen Keller meeting with Golda Meir in Israel, 1952" },
          {
            src: "3A6Israel2.jpeg",
            alt: "Another photograph from Helen Keller's meeting with Golda Meir",
            guidedDescription:
              "The back of the photo has a purple stamp of the State of Israel in Hebrew and English, and handwritten notes in pencil."
          }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `Title: Transcription for Photograph of Helen Keller, Polly Thomson, Golda Meir and Zipporah Sharett in Israel. 1952
Transcript: Black-and-white photograph showing Helen Keller seated on a sofa beside Polly Thomson, with Keller’s hand placed on Thomson’s mouth and Thomson holding Keller’s wrist. Across a round coffee table, Golda Meir and Zipporah Sharett sit facing them. Meir rests her index finger and thumb on her chin, and Sharett sits with her hands intertwined on her knee. Keller and Thomson wear dresses and hats, while Meir and Sharett are dressed in darker clothing. Several items, including ashtrays, are on the table.

[Handwritten note: Helen Keller, Polly Thompson, Golda Myerson, Mrs. ^ Zypora Sharett 1952] [Stamp: (Hebrew) STATE OF ISRAEL  Government Press Division]`,
        guidedDescription:
          "In this black-and-white photograph, Helen sits on a sofa beside Polly Thomson, while Helen “listens” to her companion by placing her thumb on Polly's throat and fingers on her lips. Golda Meir and Zipporah Sharett, wife of Moshe Sharett, Israel's second Prime Minister, sit on the other side of a round coffee table. Keller and Thomson wear colorful dresses and hats, while Meir and Sharett are dressed in darker clothing."
      },
      {
        id: "3A7",
        title: "Syria Travel Itinerary, 1952",
        displayTitle: "Syria Travel Itinerary",
        year: "1952",
        description:
          "This travel itinerary details Helen travels to the Middle East in 1952, during which she spent 5 days in Syria to raise awareness for people who are blind or deaf and visit local communities.",
        type: "document",
        images: [
          { src: "3A7Syria1.jpeg", alt: "Helen Keller's Syria travel itinerary from 1952" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: `[Handwritten note in blue ink: Pages 1-6 - Egypt Pages 6-8 Lebanon Page 9 - Syria Pages 10-13 - Jordan (a grouping brace) all each country]
-9-
Helen Keller's Visit to Syria [circled in red ink] (Damascus)
from May 5, evening to May 9, morning. 1952
Tuesday, May 6.
11.00 a.m. Press conference at the Hotel with 19 journalists from Damascus, Amman and Jerusalem.
11.45 "" Visit to Mr. Grand Parr, Public Affair Officer and to Mr. Donald Snock, Cultural Officer of the American Legation, Damascus.
3.30 p.m. Drive through the old city, shopping.
5.00 "" Visit to Mr. Cavendish Cannon, Minister of U.S.A.
Wednesday May 7.
Rest in the morning.
3.15 p.m. Mrs. Abed, mother and daughter, pay a visit to Helen and Polly in the Hotel.
4.00 "" Talk at the hall of the ""Milk Distribution Center"" of Mrs. Abed, where about 150 persons are present, mostly women. Helen asks these women:
1. to create a women's organisation for the Welfare of the Blind.
2. to take upon their hearts the necessity for opening a school and workshops for the Blind.
5.30 p.m. Reception at the U.S. - Residence. Farewell to MInister and Mrs. C.Cannon.
Thursday, May 8.
8.30 a.m. Visit to the Museum. (Director: Mr. Selim bey Adel Abdul Hak)
9.30 "" Visit to the Palais Azem, old arabic architecture.
10.30 "" Visit to the House of General Selo: Helen writes down her name in the ""Golden Book of Syria"".
11.30 "" Dr. and Mrs. C Zurayk, President of the Syrian University, Damascus, together with Dr. Djemil Saliba, Dean of the Medical Faculty and Dr. A. Chahina, Dean of the Educational Faculty, pay a visit to Helen and Polly. Dr. Saliba translated into Arabic sections out of ""The Story of my Life"". It was printed by the Ministry of Education in ""EL MOOLLEM EL ARABY"", He had sent to Helen a specimen of all the books that have as content her life's story.
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
        guidedDescription:
          "The handwriting on the top of the typed travel itinerary page indicates that these days were packed between her travels to other countries in the region, including Egypt, Lebanon, and Jordan. Times of the day appear in the left column, and underlined dates appear in a heading of the right column. A brief table of contents for Helen's entire trip to the Middle East is written in bright blue ink in the top left corner, with the word \"Syria\" circled in red both in that table, and in the underlined heading on the top of the page."
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
    screenReaderBlurb: "From Vaudeville and Radcliffe College to Hollywood, Helen Keller pursued an extraordinarily diverse life of education and work.",
    artifacts: [
      {
        id: "4A1",
        title: "Corona Portable Typewriter",
        displayTitle: "Corona Portable Typewriter",
        year: "1938",
        description: "Helen took her Corona travel typewriter everywhere with her. People would ask her to type out quotations and sign her name for them. What adventures might Helen have taken this on, and what thoughts might have she communicated with the world through its keys?",
        type: "object",
        images: [
          { src: "4A1Typewriter1.jpeg", alt: "Helen Keller\u2019s Corona portable typewriter, front view" },
          { src: "4A1Typewriter2.jpeg", alt: "Helen Keller\u2019s Corona portable typewriter, alternate view" }
        ],
        guidedDescription:
          "A metal typewriter with a glossy black finish and a standard \"QWERTY\" keyboard. Each of the keys is circular, with a chrome edge, black pad, and white characters on the surface. \"SILENT\" is printed on the upper paper tray and \"CORONA\" is printed on the face of the typewriter, both in gold. Black roller handles are on each side of the cylinder, and a chrome return arm on its left side."
      },
      {
        id: "4A2",
        title: "Photograph of Helen Evaluating Braille Typewriter, 1954",
        displayTitle: "Evaluating a Braille Typewriter",
        year: "1954",
        description: "In this photograph, Helen evaluates an electro braillewriter while working at American Foundation for the Blind. In the photo with her are AFB Director Robert Barnett, Marta Sobieski, Peter Salmon from the Industrial Home for the Blind, Polly Thomson and Gregor Ziemer. A painting of Helen by Albert H. Munsell hangs in the background.",
        type: "photograph",
        images: [
          { src: "4A2AFB1.jpeg", alt: "Helen Keller evaluating a braille typewriter at the AFB, 1954" },
          { src: "4A2AFB2.jpeg", alt: "Another view of Helen Keller at the AFB evaluating equipment, 1954" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "A black-and-white photograph shows Helen touching a small metallic box with electrical cords coming out of it. She is seated at a large table surrounded by five other people, with Polly at her side. The room is decorated with a chandelier, curtains, and an oil painting of a young Helen reading in the background. The group is dressed formally, with two men sitting at the table facing her and two standing behind her watching. A woman stands at Helen's right side, pressing a button on a dark device that looks similar to a keyboard, as Polly reaches in to help from Helen's left. Cataloging notes are both typed and written in pencil on the reverse."
      },
      {
        id: "4A3",
        title: "Helen\u2019s Vaudeville Script",
        displayTitle: "Helen\u2019s Vaudeville Script",
        year: "1920\u20131924",
        description: "Between her work as an author and employment at the American Foundation for the Blind, Helen and her companions worked the Vaudeville circuit. While it wasn\u2019t steady work, Helen enjoyed it. This script is from a show she performed with her lifelong instructor and friend, Anne Sullivan.",
        type: "document",
        images: [
          { src: "4A3Vaudeville1.jpeg", alt: "Page 1 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville2.jpeg", alt: "Page 2 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville3.jpeg", alt: "Page 3 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville4.jpeg", alt: "Page 4 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville5.jpeg", alt: "Page 5 of Helen Keller\u2019s Vaudeville script" },
          { src: "4A3Vaudeville6.jpeg", alt: "Page 6 of Helen Keller\u2019s Vaudeville script" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "Six tattered, yellowed sheets of paper each have bits missing from them, and several stains where tape used to be applied to the pages. Creases run vertically and horizontally on each. Several edits have been made to each page in both black ink and red pencil. Those pages that have a top left corner still attached have staple holes in them. \"SCRIPT\" is written on the top right corner of the first page, and \"Personal matter, Helen Keller\" is written vertically on the back of the last \u2014 both in pencil."
      },
      {
        id: "4A4",
        title: "Photograph with Charlie Chaplin, 1918",
        displayTitle: "Photograph with Charlie Chaplin",
        year: "1918",
        description: "Helen and companions Polly Thomson and Anne Sullivan took this photograph with Charlie Chaplin in a Hollywood film studio while she was filming the 1919 movie \u201CDeliverance.\u201D A camera and film set are visible behind the four of them. Keller has her left hand on Chaplin\u2019s right shoulder and her right hand on Sullivan\u2019s lips.",
        type: "photograph",
        images: [
          { src: "4A4Chaplin1.jpeg", alt: "Helen Keller with Charlie Chaplin in a Hollywood studio, 1918" },
          { src: "4A4Chaplin2.jpeg", alt: "Another photograph of Helen Keller with Charlie Chaplin, 1918" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "A black-and-white photo shows Polly Thomson, Anne Sullivan Macy, Helen Keller and Charlie Chaplin, viewed sitting left to right in a Hollywood film studio. A camera and film set are visible behind the four of them. The women are wearing suits of matching jackets and long skirts. They all wear hats and Keller wears an animal fur. Keller has her left hand on Chaplin's right shoulder and her right hand on Macy's lips. Thomson and Chaplin look directly at the camera while Macy looks at Helen. The image has chipped off slightly in each corner, and notes are typed and written in pencil on the rear of the photo."
      },
      {
        id: "4A5",
        title: "Letter of Admission to Radcliffe College, 1899",
        displayTitle: "Admission to Radcliffe College",
        year: "1899",
        description: "Helen was admitted to Radcliffe College in 1899. Radcliffe was originally a women\u2019s college that was administered by Harvard before women were admitted there, some 50 years after Helen attended.",
        type: "document",
        images: [
          { src: "4A5Radcliffe.jpeg", alt: "Helen Keller\u2019s letter of admission to Radcliffe College, 1899" }
        ],
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy",
        guidedDescription:
          "A crisp white document is headed with the circular seal of Radcliffe College on the top left. The seal has a Latin motto running round its perimeter, with angular patterns of stars in its left center, stipes in its right. Name, date, and signature lines are filled with formal cursive handwriting, and her degree is written in the same cursive toward the bottom of the paper."
      },
      {
        id: "4A6",
        title: "Perkins School Letter, 1886",
        displayTitle: "Perkins School Letter",
        year: "1886",
        description: "In this 1886 letter, Perkins School Director Michael Anagnos asked Annie Sullivan if she was interested in \u201Ca position in the family of Mr. Keller as governess of his little deaf-mute and blind daughter.\u201D Helen is not even mentioned by name, a stark contrast to the closeness of the pair once they were together.",
        type: "document",
        images: [
          { src: "4A6Perkins.jpeg", alt: "Letter from Perkins School Director to Annie Sullivan about Helen Keller, 1886" }
        ],
        guidedDescription:
          "A handwritten letter on Perkins Institution for the Blind stationary. Institutional and date information is printed in red, calligraphy-style script on the top of the page. Lines to write along are printed in light blue. Anagnos' ornate, cursive handwriting is in black ink, and his message fills the entire page.",
        transcriptTitle: "Transcript",
        transcriptText: "Missing transcript copy"
      }
    ]
  }
};

export const themeOrder = ["change", "together", "adventure", "work"];

/** Placeholder until the instructional video has a real transcript. */
export const instructionalVideoTranscript = "";

export function getTheme(themeId) {
  return themes[themeId] || null;
}

export function getThemeFocusAnnouncement(themeId) {
  const blurb = themes[themeId]?.screenReaderBlurb;
  if (!blurb) return null;
  return `${blurb} Press select key to view the artifacts in this theme.`;
}

export function getThemeCarouselLabel(themeId, themeLabel, index, total) {
  const position = `${themeLabel}, ${index + 1} of ${total}`;
  const blurb = getThemeFocusAnnouncement(themeId);
  return blurb ? `${position}. ${blurb}` : position;
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
