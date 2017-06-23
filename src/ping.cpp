#include "centsa/ping.h"
#include <iostream>

namespace ping
{
bool isAlive = true;
void alive()
{
    isAlive = true;
}

static void check()
{
    while (true)
    { // every 20 seconds check the boolean. If it's false there's no browser accessing it so we can kill this.
        std::this_thread::sleep_for(std::chrono::seconds(20));
        if (!isAlive)
        {
            std::cout << "Exiting...\n";
            exit(0);
        }
        isAlive = false;
    }
}

void init()
{
    std::thread(check).detach();
}
}