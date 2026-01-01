export default function FeaturesSection() {
    return (
        <section id="features" className="py-8 px-4 lg:py-16 lg:px-8 bg-[#F9F9F5] dark:bg-neutral-900">
            <div className="container mx-auto space-y-8 lg:space-y-12 max-w-6xl">
                <div className="text-center mb-8 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Why Choose Rejap.ai?</h2>
                    <p className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">Everything you need to master Japanese, all in one place</p>
                </div>

                <div className="flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 lg:flex-row gap-x-5 shadow-sm">
                    <div className="h-64 sm:h-80 w-full lg:w-1/2 bg-[#8BA8C7] dark:bg-[#2D3A4A] flex items-center justify-center p-8">
                        <div className="text-white text-center">
                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-xl font-semibold">Structured Learning</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 p-6 sm:p-10 lg:p-12">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4">Structured Learning Paths</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed">
                            Progress through carefully designed levels and modules, from beginner to advanced. Each lesson builds on the previous one, ensuring a solid foundation in Japanese.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 lg:flex-row-reverse gap-x-5 shadow-sm">
                    <div className="h-64 sm:h-80 w-full lg:w-1/2 bg-[#6B8E7B] dark:bg-[#2D3A32] flex items-center justify-center p-8">
                        <div className="text-white text-center">
                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xl font-semibold">Interactive Quizzes</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 p-6 sm:p-10 lg:p-12">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4">Interactive Quizzes</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed">
                            Test your knowledge with engaging quizzes after each module. Get instant feedback and track your performance to identify areas for improvement.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 lg:flex-row gap-x-5 shadow-sm">
                    <div className="h-64 sm:h-80 w-full lg:w-1/2 bg-[#F89B67] dark:bg-[#4A352D] flex items-center justify-center p-8">
                        <div className="text-white text-center">
                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-xl font-semibold">Progress Tracking</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 p-6 sm:p-10 lg:p-12">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4">Track Your Progress</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed">
                            Monitor your learning journey with detailed progress tracking. See which modules you've completed, your quiz scores, and unlock new levels as you advance.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 lg:flex-row-reverse gap-x-5 shadow-sm">
                    <div className="h-64 sm:h-80 w-full lg:w-1/2 bg-[#C597B5] dark:bg-[#3D2D38] flex items-center justify-center p-8">
                        <div className="text-white text-center">
                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <p className="text-xl font-semibold">AI-Powered</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 p-6 sm:p-10 lg:p-12">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4">AI-Powered Feedback</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed">
                            Receive personalized feedback and recommendations powered by AI. Adaptive learning adjusts to your pace and helps you focus on areas that need more practice.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
