const mixtapeNames = [
    "Neon Dreams",
    "Urban Pulse",
    "Cosmic Waves",
    "Electric Chill",
    "Midnight Vibes",
    "Groovy Beats",
    "Sonic Flow",
    "Vivid Sound",
    "Rhythm Pulse",
    "Echo Nights",
    "Fusion Groove",
    "Lunar Echo",
    "Radiant Wave",
    "Mystic Rhythm",
    "Chill Vibes",
    "Future Sounds",
    "Harmonic Drift",
    "Beat Escape",
    "Vibe Nation",
    "Zen Beats",
    "Rising Star",
    "Dreamscape Mix",
    "Soulful Echo",
    "Echo Rhythms",
    "Electric Dream",
    "Urban Beats",
    "Chill Echo",
    "Neon Pulse",
    "Cosmic Groove",
    "Midnight Waves",
    "Rhythm Flow",
    "Echo Pulse",
    "Groove Nation",
    "Sonic Chill",
    "Dream Vibes",
    "Radiant Rhythm",
    "Future Groove",
    "Lunar Beats",
    "Mystic Flow",
    "Beat Pulse",
    "Zen Echo",
    "Rising Waves",
    "Harmonic Vibes",
    "Fusion Chill",
    "Vibe Echo",
    "Neon Harmony",
    "Electric Pulse",
    "Midnight Flow",
    "Rhythm Echo",
    "Cosmic Beats",
    "Chill Pulse",
    "Urban Vibes",
    "Dream Waves",
    "Soulful Pulse",
    "Echo Harmony",
    "Electric Rhythm",
    "Groovy Chill",
    "Vivid Echo",
    "Future Echo",
    "Radiant Beats",
    "Lunar Rhythm",
    "Beat Chill",
    "Zen Pulse",
    "Rising Echo",
    "Mystic Beats",
    "Fusion Pulse",
    "Vibe Drift",
    "Neon Flow",
    "Cosmic Chill",
    "Urban Harmony",
    "Echo Beats",
    "Electric Groove",
    "Midnight Rhythm",
    "Rhythm Vibes",
    "Chill Harmony",
    "Dream Pulse",
    "Soulful Flow",
    "Radiant Chill",
    "Future Rhythm",
    "Lunar Pulse",
    "Beat Harmony",
    "Zen Groove",
    "Rising Rhythm",
    "Harmonic Echo",
    "Fusion Beats",
    "Vibe Flow",
    "Neon Rhythm",
    "Electric Vibes",
    "Cosmic Pulse",
    "Midnight Echo",
    "Rhythm Drift",
    "Chill Beats",
    "Urban Groove",
    "Dream Harmony",
    "Radiant Flow",
    "Future Pulse",
    "Lunar Vibes",
    "Beat Echo",
    "Zen Harmony",
    "Rising Pulse",
    "Vibe Chill",
    "Neon Vibes",
    "Electric Flow",
    "Cosmic Rhythm",
    "Midnight Pulse",
    "Rhythm Harmony",
    "Urban Echo",
    "Dream Beats",
    "Radiant Echo",
    "Future Chill",
    "Lunar Flow",
    "Beat Vibes",
    "Zen Rhythm",
    "Rising Beats",
    "Harmonic Flow",
    "Fusion Rhythm",
    "Vibe Harmony",
    "Neon Groove",
    "Electric Beats",
    "Cosmic Echo",
    "Midnight Harmony",
    "Dream Echo",
    "Soulful Rhythm",
    "Radiant Groove",
    "Future Beats",
    "Lunar Harmony",
    "Beat Drift",
    "Zen Vibes",
    "Rising Harmony",
    "Mystic Pulse",
    "Fusion Echo",
    "Cosmic Vibes",
    "Midnight Drift",
    "Soulful Groove",
    "Radiant Vibes",
    "Lunar Drift",
    "Harmonic Beats",
    "Fusion Vibes",
    "Cosmic Flow",
    "Midnight Beats",
    "Chill Drift",
    "Dream Flow",
    "Beat Flow",
    "Rising Vibes",
    "Mystic Harmony",
    "Neon Beats",
    "Cosmic Harmony",
    "Midnight Groove",
    "Zen Chill",
    "Rising Flow",
    "Vibe Beats",
    "Soulful Drift",
    "Radiant Harmony",
    "Future Flow",
    "Mystic Vibes",
    "Neon Echo",
    "Electric Harmony",
    "Cosmic Drift",
    "Rhythm Beats",
    "Urban Flow",
    "Dream Rhythm",
    "Soulful Harmony",
    "Radiant Pulse",
    "Future Drift",
    "Beat Groove",
    "Neon Drift",
    "Soulful Beats",
    "Future Harmony",
    "Rising Groove",
    "Vibe Pulse",
    "Electric Drift",
    "Fusion Flow",
    "Urban Rhythm",
    "Chill Groove",
    "Dream Chill",
    "Mystic Echo",
    "Zen Flow",
    "Melody Groove",
    "Harmony Pulse",
    "Tempo Shift",
    "Dynamic Beat",
    "Chord Fusion",
    "Scale Journey",
    "Key Echo",
    "Genre Blend",
    "Notation Flow",
    "Timbre Waves",
    "Structure Flow",
    "Lyric Mood",
    "Instrumentation Magic",
    "Composition Dream",
    "Performance Flair",
    "Arrangement Scene",
    "Genre Vibes",
    "Harmony Beats",
    "Rhythm Rush",
    "Tempo Tune",
    "Dynamic Swing",
    "Chord Melody",
    "Scale Mood",
    "Key Rhythm",
    "Notation Pulse",
    "Timbre Groove",
    "Structure Beat",
    "Beat Fusion",
    "Lyric Pulse",
    "Instrumentation Waves",
    "Composition Pulse",
    "Performance Groove",
    "Arrangement Harmony",
    "Genre Waves",
    "Harmony Rush",
    "Tempo Magic",
    "Dynamic Tune",
    "Scale Beat",
    "Key Groove",
    "Notation Scene",
    "Timbre Blend",
    "Structure Mood",
    "Beat Magic",
    "Lyric Flow",
    "Instrumentation Echo",
    "Composition Scene",
    "Performance Pulse",
    "Arrangement Dream",
    "Genre Echo",
    "Harmony Scene",
    "Rhythm Fusion",
    "Tempo Waves",
    "Dynamic Mood",
    "Chord Rush",
    "Scale Harmony",
    "Key Tune",
    "Notation Groove",
    "Timbre Rush",
    "Structure Echo",
    "Lyric Magic",
    "Instrumentation Blend",
    "Composition Echo",
    "Performance Dream",
    "Arrangement Pulse",
    "Genre Magic",
    "Harmony Dream",
    "Rhythm Blend",
    "Tempo Echo",
    "Dynamic Fusion",
    "Chord Flow",
    "Scale Rush",
    "Key Scene",
    "Notation Blend",
    "Timbre Pulse",
    "Structure Harmony",
    "Beat Dream",
    "Lyric Vibes",
    "Instrumentation Harmony",
    "Composition Magic",
    "Performance Scene",
    "Arrangement Echo",
    "Genre Rhythm",
    "Harmony Magic",
    "Rhythm Tune",
    "Tempo Pulse",
    "Dynamic Echo",
    "Chord Scene",
    "Scale Vibes",
    "Key Magic",
    "Notation Harmony",
    "Timbre Flow",
    "Structure Rush",
    "Lyric Blend",
    "Instrumentation Flow",
    "Composition Rush",
    "Performance Harmony",
    "Arrangement Tune",
    "Genre Flow",
    "Harmony Blend",
    "Rhythm Scene",
    "Tempo Rush",
    "Dynamic Vibes",
    "Chord Echo",
    "Scale Scene",
    "Key Vibes",
    "Notation Vibes",
    "Timbre Scene",
    "Structure Pulse",
    "Lyric Echo",
    "Instrumentation Pulse",
    "Composition Flow",
    "Performance Blend",
    "Arrangement Magic",
    "Genre Pulse",
    "Harmony Vibes",
    "Rhythm Magic",
    "Tempo Harmony",
    "Chord Vibes",
    "Scale Echo",
    "Key Harmony",
    "Notation Rush",
    "Lyric Harmony",
    "Instrumentation Scene",
    "Composition Tune",
    "Performance Rush",
    "Arrangement Vibes",
    "Genre Tune",
    "Harmony Echo",
    "Tempo Scene",
    "Dynamic Scene",
    "Chord Pulse",
    "Scale Flow",
    "Key Pulse",
    "Notation Magic",
    "Timbre Harmony",
    "Structure Tune",
    "Beat Rush",
    "Lyric Rush",
    "Instrumentation Vibes",
    "Performance Magic",
    "Arrangement Flow",
    "Genre Scene",
    "Tempo Vibes",
    "Chord Beat",
    "Key Flow",
    "Timbre Echo",
    "Structure Vibes",
    "Beat Scene",
    "Performance Vibes",
    "Arrangement Rush",
    "Genre Harmony",
    "Harmony Tune",
    "Tempo Blend",
    "Chord Magic",
    "Scale Rhythm",
    "Key Blend",
    "Timbre Magic",
    "Instrumentation Rush",
    "Composition Blend",
    "Performance Flow",
    "Harmony Flow",
    "Dynamic Harmony",
    "Chord Rhythm",
    "Scale Pulse",
    "Notation Beat",
    "Timbre Tune",
    "Beat Blend",
    "Lyric Scene",
    "Genre Rush",
    "Dynamic Pulse",
    "Key Rush",
    "Instrumentation Tune",
    "Dynamic Rush",
    "Scale Blend",
    "Notation Echo",
    "Timbre Vibes",
    "Structure Scene",
    "Dynamic Flow",
    "Arrangement Blend",
    "Chord Blend",
    "Structure Rhythm",
    "Beat Tune",
    "Chord Harmony",
    "Lyric Tune"
]

export default mixtapeNames;