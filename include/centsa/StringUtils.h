#ifndef STRING_UTILS_H
#define STRING_UTILS_H

#include <string>
#include <sstream>
#include <vector>
#include <iterator>
#include <regex>

template <typename Out>
inline void _split(const std::string &s, char delim, Out result)
{
    std::stringstream ss;
    ss.str(s);
    std::string item;
    while (std::getline(ss, item, delim))
    {
        *(result++) = item;
    }
}

inline std::vector<std::string> split(const std::string &s, char delim)
{
    std::vector<std::string> elems;
    _split(s, delim, std::back_inserter(elems));
    return elems;
}

inline bool StartsWith(std::string string, const char *match)
{
    const char *cc = string.c_str();
    for (int i = 0; *match; i++, match++)
    {
        if (cc[i] != *match)
            return false;
    }
    return true;
}

inline int replaceFirst(std::string &s, const char *find, const char *replace, int pos)
{
    size_t fLen = std::string(find).length();
    size_t f = s.find(find, pos);
    if (!(f + 1))
    {
        return 0;
    }

    s.replace(f, fLen, replace);
    return f;
}

inline void replaceAll(std::string &s, const char *find, const char *replace, int pos)
{
    size_t fLen = std::string(find).length();
    size_t rLen = std::string(replace).length();
    size_t f = -rLen + pos;
    while (true)
    {
        f = s.find(find, f + rLen);
        if (!(f + 1))
        {
            break;
        }

        s.replace(f, fLen, replace);
    }
}

inline std::string trim(std::string s)
{
    return std::regex_replace(std::regex_replace(s, std::regex("\\s+$"), ""), std::regex("^\\s+"), "");
}

#endif