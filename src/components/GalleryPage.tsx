import { useState, useEffect } from "react";
import { FaPlay, FaImages, FaVideo } from "react-icons/fa";
import ChibiBattleRoyalBG from "../assets/ChibiBattleRoyalBG.png";

const GalleryPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Gallery";
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const photos = [
    { id: 1, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/597659838_10162534233876374_8012791944975857271_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Siq9tT2PxzoQ7kNvwH8R996&_nc_oc=AdlzKt9v_EV4F4m_PcVPhF3yOBMVVF1yjvn6h5CdhRqZvKS1kosLlWrzoxgl3MDcVmE&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=iFRDqd3tRMHeuofL83U4YQ&oh=00_Afrj02OwDNY6nCJ_TIPd5-3hUf_SJXZUJqKC0-B5nBngHw&oe=696791B4", alt: "Tournament Match 1" },
    { id: 2, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/596702071_10162534233641374_5625263377757231726_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=q8YmfwgUrTcQ7kNvwFHAV5m&_nc_oc=AdlsmmUMPTuEh6ya89phu4t2LsR42OHbr16XIdYHspnSR8BoaDH2Hzttdfm4LQF2yH0&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=33Ne7xOaal2oRfvLviBHcg&oh=00_AfoAzBNkVRmpT9QPq7LwSrt-6_zjxq1CF56ZGn3d7wHB4g&oe=696783D5", alt: "Social Event" },
    { id: 3, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/597659366_10162534229696374_1444841718102066684_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=XuwGLRfy6IQQ7kNvwEnx0oW&_nc_oc=AdnYcpbEAKo-BwHMOnBc2dPwPgvp8ljXzoAVYwNmLZ3SMuULgD8vba93GTIyL9q-Xr8&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=gTCKVrqx9pqBO6x8ZFXcOg&oh=00_AfoLUWAxUHLzYGZsxta_3grcCFu4ndGdJKA4umwcVvjrbg&oe=69678E60 ", alt: "Championship Finals" },
    { id: 4, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/596944641_10162534220926374_4292247265139194818_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=5z3Z3Fe0_S8Q7kNvwERlxMi&_nc_oc=Adns9A1nZj_nmCpU3JcZPWA7Dn9MoMDCODlqdBW-VJooRaRST62uOYg6lWxQ-QXXoSY&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=Ub8bzGHk-5ZxTJVA6CWrRA&oh=00_AfqjHNXZqvPjgAeFrjcIp32M6tRl8-bQQsemFgSxwIYu6w&oe=696796A2", alt: "Training Session" },
    { id: 5, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/597663250_10162534218886374_2751278107016508363_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=SJ1d9FkbBj0Q7kNvwHvU_-g&_nc_oc=Adk6SBfTYrua96mQiKeYUS-AEP4z7O7fZ36deY09op4QesFodMjTcUXKr4UH-118HaY&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=ZoCiaVXRuTZ6lLtQSyX00g&oh=00_Afq0x73YyhlfvLDW1rxm0aXess3MW4yxaU7nu3Onxm8qhQ&oe=69678A50", alt: "Community Gathering" },
    { id: 6, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/598579247_10162534217196374_15296884953587831_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=GSfTjdYXMZUQ7kNvwH8PfS_&_nc_oc=AdksjZ9WexnT4sr6XwWeKxWGolYUnafR35W8jxFAgWs9vOEIw29S4aqWKZTJF0vv3Ws&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=bBqc0VdddH0dqSmryGLPeA&oh=00_Afo481V9QWg8dK9NULC6NLRjQrtlaqCqAJJbYoA_2E54MQ&oe=6967A900", alt: "Award Ceremony" },
    { id: 7, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/597382960_10162534216026374_4140582211579518368_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=5Qo-7cw_gtMQ7kNvwGqGR2d&_nc_oc=AdkHfaym72kN5cSsxmpVjpMjcm9aqM5tZS6aaT-JJMuM-C-f0E6FrXIczmhXOvBNpnk&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=hSEwfvbAqCayXgquvcaqPA&oh=00_AfpYzC0zYuZ1_1a56ZvuCfCCggyyD_T948jlv53Ryp7q1A&oe=6967ABF7", alt: "Beginner Workshop" },
    { id: 8, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/596797596_10162534214221374_6355354731171076409_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=VRNdbgyAjwMQ7kNvwGUygmy&_nc_oc=Adl81P7vP2nKtG_lUsNUCCH30aVFKG-FjYbbBLAJzAQx8siejbZStU03Z13Qk0IEqHw&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=1ucbzcEzq1qj20-RhxU8sg&oh=00_AfpXZFR92FS2b260ZIuaYodqZPAoO4qsx8co62tUI2FDKg&oe=6967A6EC", alt: "Team Photo" },
    { id: 9, src: "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-6/598330670_10162534193271374_651834015097244526_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=xaXn0KfcWQAQ7kNvwHVFmm-&_nc_oc=AdlYMDJCfo0MKFS1CTNLRY2z6iuVtn5QhoOrO8c9rn3_T6jWXaUsMxeEx0Xmzdu1dJ0&_nc_zt=23&_nc_ht=scontent-syd2-1.xx&_nc_gid=f-UkGtk3iWn8DOpwSpBz8A&oh=00_AfoBaOPhdOfg1ttkUatDvhrxjLCQ7rjAlYW4xNt0IdmS9w&oe=69678F5C", alt: "Tournament Match 2" },
  ];

  const videos = [
    {
      id: 1,
      title: "Chibi Wednesday Playtime",
      embedId: "-BW1Cf0IPX8",
      thumbnail: "https://img.youtube.com/vi/-BW1Cf0IPX8/0.jpg",
    },
    {
      id: 2,
      title: "Chibi Friday Playtime",
      embedId: "d3RmpKNzgsI",
      thumbnail: "https://img.youtube.com/vi/d3RmpKNzgsI/0.jpg",
    },
    {
      id: 3,
      title: "Chibi  Battle Royale #1",
      embedId: "cDn4hZ3pWFU",
      thumbnail: "https://img.youtube.com/vi/cDn4hZ3pWFU/0.jpg",
    },
    {
      id: 4,
      title: "Chibi  Veteran Tournament 2025 (Albury/Wodonga)",
      embedId: "5Uq_Sv-b1K0",
      thumbnail: "https://img.youtube.com/vi/5Uq_Sv-b1K0/0.jpg",
    },
  ];

  return (
    <div
      className="w-full overflow-x-hidden min-h-screen"
      style={{
        backgroundImage: `url(${ChibiBattleRoyalBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full overflow-x-hidden min-h-screen">


        <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
          {/* Two Column Layout: Photos (70%) and Videos (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8">
            {/* Photos Column - 70% width (7/10 columns) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <FaImages className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Photo Gallery
                  </h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Capturing the best moments from our tournaments, events, and community gatherings
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => setSelectedImage(photo.src)}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 rounded-full p-3">
                            <FaImages className="text-green-600" size={24} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Videos Column - 30% width (3/10 columns) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 sticky top-24">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <FaVideo className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Videos
                  </h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Watch highlights and recaps from our events
                </p>
                <div className="overflow-y-auto max-h-[calc(3*(200px+1.5rem))] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  <div className="space-y-6">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-video bg-gray-200">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300">
                            <a
                              href={`https://www.youtube.com/watch?v=${video.embedId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300 transform hover:scale-110"
                            >
                              <FaPlay className="text-white ml-1" size={20} />
                            </a>
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <h3 className="font-semibold text-sm md:text-base text-black line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 text-center mt-6 italic">
                  Stay tuned for more exciting video highlights!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors duration-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
