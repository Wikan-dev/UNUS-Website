const StatisticHomeList = [
  {
    stats: "38.000+",
    title: "Mahasiswa Aktif",
    para: "Sarjana, Terapan, Magister, & Doktoral",
  },
  {
    stats: "98%",
    title: "Keterserapan Lulusan",
    para: "Bekerja & berwirausaha dalam <6 bulan",
  },
  {
    stats: "14 / 72",
    title: "Fakultas & Prodi",
    para: "Terakreditasi Unggul & Internasional ASIIN",
  },
  {
    stats: "Top 50",
    title: "QS Asia University",
    para: "Reputasi Akademik & Kemitraan Global",
  }
]

export default function StatisticHome() {
  return (
    <section className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
      {StatisticHomeList.map((item) => (
        <div
          key={item.title}
          className='bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-xs hover:shadow-md transition-shadow'
        >
          <div className='text-3xl sm:text-4xl font-bold font-merrie text-sidebar tracking-tight'>
            {item.stats}
          </div>
          <h3 className='text-sm sm:text-base font-semibold text-gray-800 mt-2 font-inter'>
            {item.title}
          </h3>
          <p className='text-xs text-gray-500 mt-1 leading-relaxed'>
            {item.para}
          </p>
        </div>
      ))}
    </section>
  )
}
