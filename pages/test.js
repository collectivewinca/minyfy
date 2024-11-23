import MixtapeCard from "@/utils/MixtapeCard";

const MixtapeGrid = () => {
  const mixtapes = [
    {
      name: "structure pulse",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny-Vinyl-Playlist-(Mixtape)-featuring-tracks---Dance-The-Night---From-Barbie-The-Album---Dua-Lipa---All-The-Small-Things---Blink-182---Who-Dat-Boy-(Feat.-A%24AP-Rocky)---Tyler%2C-The-Creator---Hold-My-Hand---Jess-Glynne?alt=media&token=dff19973-9f9e-42e2-82ee-00ade98066c7",
      shortenedLink: "https://go.minyvinyl.com/rkmix"
    }
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {mixtapes.map((mixtape) => (
          <MixtapeCard key={mixtape.name} imageUrl={mixtape.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default MixtapeGrid;