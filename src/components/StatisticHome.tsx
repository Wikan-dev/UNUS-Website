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
    <div className='w-auto bg-background-card mx-15 p-5'>
      <div className='flex flex-row justify-between'>
        {StatisticHomeList.map((list) => (
          <div key={list.title} className='font-merrie'>
            <h1 className='text-6xl font-bold'>{list.stats}</h1>
            <h3 className='text-2xl font-inter font-medium mt-2'>{list.title}</h3>
            <p>{list.para}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
