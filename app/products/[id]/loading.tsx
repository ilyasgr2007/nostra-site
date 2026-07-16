export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-black border-b-black border-l-transparent border-r-transparent dark:border-t-white dark:border-b-white dark:border-l-transparent dark:border-r-transparent"></div>
      <div className="mt-4 text-4xl font-bold text-black dark:text-white">١١١</div>
    </div>
  )
}
