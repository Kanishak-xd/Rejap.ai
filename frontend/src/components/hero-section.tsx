import { Button, buttonVariants  } from "@/components/ui/button";

export default function HeroSection() {

  return (
    <section className="">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-4xl">
        <h1 className="font-bold leading-none text-4xl sm:text-5xl md:text-5xl xl:text-6xl dark:text-white">
          Lucifer – Your Campus <br/>Companion
        </h1>
        <p className="mt-8 mb-12 text-lg sm:text-xl xl:text-2xl font-normal text-neutral-500 max-w-2xl px-4">
          Meals, classes, and reminders made easy, Lucifer keeps campus life simple.
        </p>
        <div className="flex flex-wrap items-center justify-around w-sm gap-y-4 md:w-md">
          <a href="https://discord.com/oauth2/authorize?client_id=1338873280941129789&permissions=257024&integration_type=0&scope=bot+applications.commands" 
            className="px-10 py-3 text-lg font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer"
          >
            Add to Discord
          </a>
          <Button 
            className={buttonVariants({variant: "ghost", className: "border-1 border-neutral-600 bg-[transaprent] text-black dark:text-white flex justify-center items-center text-center text-xl px-8 py-6.5 rounded-2xl",})} onClick={() => {
              const element = document.getElementById("features");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Features
          </Button>
        </div>
      </div>
    </section>
  );
}

