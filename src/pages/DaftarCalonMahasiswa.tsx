import type DaftarCalonMahasiswa from '../helper/types.tsx'; 

export default function CalonMahasiswa() {
  return (
    <div>
     <form className='[&_input]:border flex flex-col gap-4 w-fit'>
        <input placeholder='no. pendaftaran' />
        <input placeholder='Nama Pendaftar' type='text' />
        <input placeholder='Asal Sekolah' type='text' />
        <input placeholder='ijazah' type='file' accept='image/' />
        <input placeholder='kk' type='file' accept='image/' />
        <input placeholder='status Dokumen' type='text' />
      </form>
    </div>
  )
}
