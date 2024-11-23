import React, { useState, useEffect, Suspense } from 'react';
import { IoCaretUpSharp } from 'react-icons/io5';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import confetti from 'canvas-confetti';
import { db, auth } from '@/firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import HexagonMesh from '@/utils/HexagonMesh';
import { ExternalLink } from 'lucide-react';

const images = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2FMiny%20Vinyl%20Record%20Playlists%20Mixtapes%20for%20Artist%20Track.webp?alt=media&token=a4349d55-e1a5-4bd3-990f-4805e4c90f5f',
    link: 'https://go.minyvinyl.com/aclfestanthem',
    MixtapeId: 'Qe6nRzVhSPWd0IhSsP4g',
    label: 'Top Mixtape 1',
    name: 'ACL : Festival Anthems'

  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Mystery-Of-Love---Sufjan-Stevens---You-Stepped-Out-Of-A-Dream---Samara-Joy---Stereo-Hearts---Maroon-5---Break-Up-Song---Veruca-Salt?alt=media&token=652fd8ad-5cad-47fc-af58-599108bc7723",
    link: 'https://go.minyvinyl.com/offplaylist1',
    MixtapeId: 'zMUT6FyJ4Vt9qwlurF4Y',
    name: 'off playlist',
    label: 'Top Mixtape 2'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Yeh-Ishq-Hai---Sanaea-Bubber---Hum---Sanaea-Bubber---%E2%9C%A8Literally%E2%9C%A8-Translating-Indian-Songs-(Compilation-1-25)---Sanaea-Bubber---%E2%9C%A8Literally%E2%9C%A8-Translating-Indian-Songs-%7C-Achacho-Punnagi-%7C-Transcribed-By-Sutharv---Sanaea-Bubber?alt=media&token=41147bfa-3260-4f1b-a3ae-bce3ca9096a4",
    link: 'https://go.minyvinyl.com/thebubberfiles',
    MixtapeId: 'KRFMPPUluUbvoGQzg0V4',
    name: 'the bubber files',
    label: 'Top Mixtape 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Disappearing-Clothes---Coota-Brown?alt=media&token=7fa10b42-525d-411d-922b-0cff2f7f9f21",
    link: 'https://go.minyvinyl.com/coomix',
    MixtapeId: 'n7ff7fFKLVIRl7ITw8n2',
    name: 'Coota Feature',
    label: 'Featured Artist 1'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Roll-On-Me---Lavaud---Oh-My---Lavaud---In-This-Room---Lavaud---3AM-In-London---Lavaud?alt=media&token=bcbbbf07-f00c-4f2a-b13b-25b52eef3f45",
    link: 'https://go.minyvinyl.com/lavosmix',
    MixtapeId: 'k0KjOatJ2lZG7oxQ83W6',
    name: 'lavosmix',
    label: 'Featured Artist 2'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Gaayab---Viepsa-Arora---Sagittarius-Szn---Viepsa-Arora---Jashn-E-Bahara---Viepsa-Arora---London-Is-Cold---Viepsa-Arora?alt=media&token=1fd367d6-5ed8-496a-9f31-462988807064",
    link: 'https://go.minyvinyl.com/viepsamix',
    MixtapeId: 'Y8gzr3Mid7DI0OqaRV73',
    name: 'Rumi Revenge Mix', 
    label: 'Featured Artist 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Chup-Chup-Ke---Shankar-Ehsaan-Loy---Hona-Tha-Pyar---Atif-Aslam---Pehla-Nasha---Udit-Narayan---Chalo-Tumko-Lekar%2C-Pt.-1---Shreya-Ghoshal?alt=media&token=17d15491-f41a-4742-b2e2-73e0685f515f",
    link: 'https://go.minyvinyl.com/handpickinten',
    MixtapeId: 'b7nGl7QNrsAL9cWDFrbX',
    name: 'handpickinten',
    label: 'Featured Curator 1'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---3AM-In-London---Lavaud---Booboo---Yaeji---Lost-In-Between---XTIE-Feat.-Anniina---%40MSMSMSM_FOREVER---Sophie?alt=media&token=2f9ce9ca-f656-4e42-b8cf-4ff09a4a6ec6",
    link: 'https://go.minyvinyl.com/septpick',
    MixtapeId: 'hR4s0Xgbt4JhbZIOI01X',
    name: 'Artists by shesaid.so',
    label: 'Featured Curator 2'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Cold-Reactor---Everything-Everything---Grace---IDLES---Off-With-Her-Tits---Allie-X---Ruined---Adrianne-Lenker?alt=media&token=9cd51428-16b6-466a-b8d3-b148c465b8fb",
    link: 'https://go.minyvinyl.com/myllck24',
    MixtapeId: 'rV7OlY1rBJUpC7Wki8C4',
    name: 'myllck 2024 fave',
    label: 'Featured Curator 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Karma---Taylor-Swift---Never-Meant---American-Football---Spanish-Sahara---Foals---Cassius---Foals?alt=media&token=e043833f-bd13-4e03-91a8-a467f4c10339",
    link: 'https://go.minyvinyl.com/thealgorithm',
    MixtapeId: 'QbDCyRWwpgBE7h818243',
    name: 'the algorithm',
    label: 'Featured Genre 1'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Kill-Bill---SZA---As-It-Was---Harry-Styles---Dark-Red---Steve-Lacy---Ivy---Frank-Ocean?alt=media&token=851e15a2-e3e6-48e9-991d-6eaadec84e0c",
    link: 'https://go.minyvinyl.com/BedroomBeats',
    MixtapeId: 'zIIeXOeegkFNO8NjToF1',
    name: 'Bedroom Beats',
    label: 'Featured Genre 2' 
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Flowers---Cibo-Matto---Falling-Out-Of-Love-At-This-Volume---Bright-Eyes---Babies-(Are-So-Strange)---Kero-Kero-Bonito---So-Finha-De-Ser-Com-Voce---Astrud-Gilberto?alt=media&token=96d069c1-dccf-4e38-931e-c553bcb01913",
    link: 'https://go.minyvinyl.com/sweetrap',
    MixtapeId: '4cqkbBGC7SovpwPqMx9p',
    name: 'sweet trap',
    label: 'Featured Genre 3'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Sunshine-Song-(Thomas-Gold-Remix)---Nicole-Otero---Sunshine-Song-(Arno-Cost-Remix)---Nicole-Otero---Sunshine-Song-(Original-Mix)---Nicole-Otero---Sunshine-Song---Thomas-Gold-Radio-Edit---Nicole-Otero?alt=media&token=4752f5a1-31cd-41e9-907d-3e579a36b7a9",
    link: 'https://go.minyvinyl.com/djnicole',
    MixtapeId: 'RucQF3yK4s2Hjih5ezdn',
    name: 'DJ nicole',
    label: 'Live Performer 1'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---The-American-Metaphysical-Circus---The-United-States-Of-America---Accidents-Will-Happen---Broadcast-Remix---The-Projects---Plastic-Mile---Stereolab---Variations-on-Pachelbel's-Canon---Emerald-Web?alt=media&token=66e29eaa-adc0-4220-a19b-e08c4fbc2685",
    link: 'https://go.minyvinyl.com/tracyten',
    MixtapeId: 'MVpD6wM1JaY3qgPLVxI4',
    name: 'tracy ten',
    label: 'Live Performer 2'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Kind-Regards---Keith-Juluka---Mev.-Du-Plessis---Keith-Juluka---Kind-Regards-(Viral-Version)---Keith-Juluka---Tmoty---Keith-Juluka?alt=media&token=d5ab8d91-2b28-4c46-8ecf-67e7448f92ec",
    link: 'https://go.minyvinyl.com/julumixy',
    MixtapeId: '4jA0aeOE95Z65HIPX21Z',
    name: 'julumixy',
    label: 'Live Performer 3'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Mangos-%26-Wine---Remastered-2023---Afro-Dominicano---Solito---Afro-Dominicano---No-Se-Mueva-La-Cuna---Afro-Dominicano---Santeria---Afro-Dominicano?alt=media&token=e8e21d46-944a-46f5-bcc9-9e2eb88f430e",
    link: 'https://go.minyvinyl.com/afrodomini',
    MixtapeId: 'UxxXRfy1UKN2wx6I4j7P',
    name: 'afro dominicano',
    label: 'Subway Musician 1'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Brazil---The-Blue-Dahlia---Laura---The-Blue-Dahlia---The-Way-You-Look-Tonight---The-Blue-Dahlia---New-York%2C-New-York---The-Blue-Dahlia?alt=media&token=6c975240-a3d4-4b47-b04e-9338180907d2",
    link: 'https://go.minyvinyl.com/thebluedalhia',
    MixtapeId: 'x90HQK8w6SW5lqa53sc1',
    name: 'the blue nation',
    label: 'Subway Musician 2'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Sicilienne---Luellen-Abdoo---Sonata-Concertata%3A-Adagio---Luellen-Abdoo---Sonata-Concertata%3A-Rondo---Luellen-Abdoo---Sonata-Concertata%3A-Allegro---Luellen-Abdoo?alt=media&token=a86eb3ff-f755-4047-88be-263eed97badd",
    link: 'https://go.minyvinyl.com/abdoo',
    MixtapeId: '75c2jQVezsGYkC5qS6TH',
    name: 'abdoo',
    label: 'Subway Musician 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---SO-WHAT---Allan-Harris---Get-Ready---Allan-Harris---I-Grew-Up-(Kate'S-Place)---Allan-Harris---You-Bring-Out-The-Best-In-Me---Allan-Harris?alt=media&token=19e6a662-7271-42d8-a753-8bb9bbadf423",
    link: 'https://go.minyvinyl.com/harrisblend',
    MixtapeId: '5BdBDxBUs4KC4LLezIHv',
    name: 'harris blend',
    label: 'New York 1'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Got-My-Number---Radio-Edit---Alex-Cano---Back-Against-The-Wall---Alex-Cano---Got-My-Number---Alex-Cano---I'Ll-Wait---Alex-Cano?alt=media&token=1b7ade72-bc4b-45d3-b8ca-fffcf55b54ab",
    link: 'https://go.minyvinyl.com/canorush',
    MixtapeId: 'hYhs8x3NTxa7KIjhLRWJ',
    name: 'canorush',
    label: 'New York 2'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Harlem-Salsa---Troy-Weekes-Music---Bifaysic-Sleep-Paralysis-(Feat.-Mark-Ferg%2C-Troy-Weekes-Music-%26-Liberty-Styles)---LiKWUiD-%26-2-Hungry-Bros---Trying-To-Survive---Troy-Weekes-Music---Trying-So-Hard---Troy-Weekes-Music?alt=media&token=5a2daa7c-36fa-47c3-8db3-0dc7c37de8a8",
    link: 'https://go.minyvinyl.com/weekes',
    MixtapeId: '5Ql9OmZiBRYstvlI5uKN',
    name: 'weekes',
    label: 'New York 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---2-Can-Play-That-Game-(Feat.-Nubia-Emmon)---Cha'Keeta-B---Fall-Back-(Feat.-Alesia-Lani)---Cha'Keeta-B---Cha'Keeta-B-2-Can-Play-That-Game-Ft-Nubia-Emmon---Cha'Keeta-B---Aromatic---Cha'Keeta-B?alt=media&token=2927a57d-0736-402b-a68e-b04d1330174b",
    link: 'https://go.minyvinyl.com/chakeeta',
    MixtapeId: 'dkQT0TtstanC9lE99XGM',
    name: 'chakeeta',
    label: 'Austin 2'
  },
   {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Foxhole---Curtis-McMurtry---Ghost-In-My-Bed---Curtis-McMurtry---Whiskey-Sweat---Curtis-McMurtry---Wrong-Inflection---Curtis-McMurtry?alt=media&token=ffa0b0b6-fc1b-4157-8e30-e9df03c35642",
    link: 'https://go.minyvinyl.com/curtis',
    MixtapeId: 'WDyNIO3B3fb5XZBQ2f1N',
    name: 'curtis',
    label: 'Austin 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---SILKSCREEN---Avara---Let-It-Go...-(Outro)---Avara---Been-Some-Time-(Need-U)---Avara---Duck-%26-Roll---Avara?alt=media&token=dbff874c-f342-454e-8745-81a22d386aa5",
    link: 'https://go.minyvinyl.com/avarafusion',
    MixtapeId: 'nGvBUEZvPHJ3251xj6dB',
    name: 'avara fusion',
    label: 'Austin 1'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Toxic---Tai-Mistyque---Be-Without-Me---Tai-Mistyque---Reminder---Tai-Mistyque---Where-Do-I-Go---Tai-Mistyque?alt=media&token=70a981b0-83bc-48c3-bd02-afa69b842e90",
    link: 'https://go.minyvinyl.com/taiingen',
    MixtapeId: 'FfiZ8lrmj7cjrxv1xsWW',
    name: 'tai ingen',
    label: 'Chicago 2'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Attitude---Buggin---Snack-Run---Buggin---All-Eyes-On-You---Buggin---Brainfreeze---Buggin?alt=media&token=7c9abd3e-2768-4e6c-9cd5-9e9967148815",
    link: 'https://go.minyvinyl.com/buggin',
    name: ' buggin',
    MixtapeId: 'OrwCqXDmwN60yOzXFsFs',
    label: 'Chicago 3'
  },
  {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---90'S-R%26B---Troy-Tyler---Valentine'S-Day-(Interlude)---Troy-Tyler---Ooh-Ahh---Troy-Tyler---Early-Morning-Lovin'---Troy-Tyler?alt=media&token=04b9104a-5e8a-4f97-aa2c-65c6cb691006",
    link: 'https://go.minyvinyl.com/ingentyler',
    name: 'ingentyler',
    MixtapeId: 'owVp0mt7uVFKAaJSnWBH',
    label: 'Chicago 3'
  }
  
];

const MixtapeGrid3D = ({ mixtapes, handleUpvote, votes, user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-6 gap-16 max-w-[1800px] ">
      {mixtapes.map((mixtape) => (
        <div
          key={mixtape.MixtapeId || mixtape.name}
          className="relative h-[450px] bg-black shadow-xl rounded-xl overflow-hidden  group transform transition-transform hover:scale-[1.02]"
        >
          <Canvas shadows dpr={[1, 2]} className='pt-10'>
            <PerspectiveCamera makeDefault position={[0, 0, 3]} />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
            <ambientLight intensity={0.5} />
            <spotLight
              position={[5, 5, 5]}
              angle={0.25}
              penumbra={1}
              intensity={0.5}
              castShadow
            />
            <Environment preset="studio" />
            <Suspense fallback={null}>
              <HexagonMesh
                imageUrl={mixtape.imageUrl}
                isPlaying={true}
              />
            </Suspense>
          </Canvas>

          <div className="absolute top-0 left-0 right-0 px-4 py-2 ">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white capitalize mb-1">
                  {mixtape.name}
                </h3>
                <a
                  href={mixtape.link || mixtape.shortenedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#78bf45] hover:text-[#78bf45] transition-colors"
                >
                  Listen Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              {handleUpvote && (
                <div 
                  className={`flex flex-col justify-center items-center border pb-1 rounded-md px-2 cursor-pointer transition-all duration-300 
                    ${votes[mixtape.MixtapeId] > 0 
                      ? 'border-[#78bf45] text-[#78bf45] bg-[#78bf45]/10' 
                      : 'border-gray-300 text-slate-600 hover:border-[#78bf45]/50'}`}
                  onClick={() => handleUpvote(mixtape.MixtapeId)} 
                >
                  <IoCaretUpSharp className={`text-xl leading-none 
                    ${votes[mixtape.MixtapeId] > 0 
                      ? 'text-[#78bf45]' 
                      : 'text-gray-600 group-hover:text-[#78bf45]/50'}`} 
                  />
                  <span className="text-xs -mt-[1px]">{votes[mixtape.MixtapeId] || 0}</span>
                </div>
              )}
              
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ImageGallery = () => {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState({});
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      const newVotes = {};
      const votePromises = images.map(async (mixtape) => {
        const docRef = doc(db, "mixtapes", mixtape.MixtapeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          newVotes[mixtape.MixtapeId] = docSnap.data().voteCount || 0;
        } else {
          newVotes[mixtape.MixtapeId] = 0;
        }
      });
      await Promise.all(votePromises);
      setVotes(newVotes);
    };

    fetchVotes();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleUpvote = async (mixtapeId) => {
    if (!user) {
      handleLogin();
      return;
    }

    try {
      const docRef = doc(db, 'mixtapes', mixtapeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const hasVotedToday = data.votedBy.some(vote =>
          vote.userId === user.uid &&
          vote.date.toDate().toDateString() === new Date().toDateString()
        );

        if (hasVotedToday) {
          alert("You've already voted today!");
          return;
        }

        await updateDoc(docRef, {
          voteCount: increment(1),
          votedBy: [...data.votedBy, { userId: user.uid, date: new Date() }]
        });

      } else {
        await setDoc(docRef, {
          mixtapeId,
          voteCount: 1,
          votedBy: [{ userId: user.uid, date: new Date() }]
        });
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#78bf45', '#96ed58', '#4f9120'],
      });

      setVotes((prevVotes) => ({
        ...prevVotes,
        [mixtapeId]: (prevVotes[mixtapeId] || 0) + 1,
      }));

      setVoted((prevVoted) => ({
        ...prevVoted,
        [mixtapeId]: true,
      }));

    } catch (error) {
      console.error('Error updating vote count: ', error);
    }
  };


  const renderImageSection = (title, subtitle, startIndex, endIndex) => (
    <div className="mb-8 font-jakarta">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-600 mb-4">{subtitle}</p>
      <MixtapeGrid3D
        mixtapes={images.slice(startIndex, endIndex)}
        handleUpvote={handleUpvote}
        votes={votes}
        user={user}
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      {renderImageSection("Top Mixtapes This Week", "Most popular tracks of the week", 0, 3)}
      {renderImageSection("Featured Artists", "Discover mixtapes from featured artists", 3, 6)}
      {/* {renderImageSection("Featured Curators", "Discover mixtapes from the best curators", 6, 9)} */}
      {/* {renderImageSection("Featured Genres", "Discover mixtapes by genre", 9, 12)} */}
      {/* {renderImageSection("Featured Live Performers", "Discover mixtapes from live performers", 12, 15)}
      {renderImageSection("Featured Subway Musicians", "Discover mixtapes from subway musicians", 15, 18)}
      {renderImageSection("Featured from New York", "Discover mixtapes from artists in New York", 18, 21)}
      {renderImageSection("Featured from Austin, Texas", "Discover mixtapes from artists in Austin, Texas", 21, 24)}
      {renderImageSection("Featured from Chicago", "Discover mixtapes from artists in Chicago", 24, 27)} */}
    </div>
  );
};

export default ImageGallery;