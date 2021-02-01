## Contributing

I'd love your help to make *Library Map* as accurate and useful as possible.

### How to contribute your idea, bug report or improvement

1. Look at the [current GitHub issues tagged `help wanted`](https://github.com/hughrun/public_library_map/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) to see if you can help. Most of these will be to do with updating data, like finding street addresses or other information.
2. You can [create a new issue](https://github.com/hughrun/public_library_map/issues) on GitHub.
3. You can [send a pull request](https://docs.github.com/en/github/.collaborating-with-issues-and-pull-requests/about-pull-requests) &mdash; though it is *strongly preferred* that you either ask to be assigned to an existing issue (so everyone knows you're working on it), or create a new issue, first.
4. You can just send an email to `librarymap`@`hugh`.`run` and ask me to fix/add something.

### If you have not used Git or GitHub before

There is a class outline for an [introduction to Git and GitHub aimed at librarians](https://librarycarpentry.org/lc-git/) at `librarycarpentry.org`. This assumes you are using the command line. If you create or already have a GitHub account, you can also [edit files directly in the browser](https://docs.github.com/en/github/managing-files-in-a-repository/editing-files-in-another-users-repository), or use [GitHub Desktop](https://desktop.github.com/) - both of which are probably less intimidating options if you don't have any desire to learn how to use a command line/shell interface, or just want to make a single minor update.

### Which files to update

To update information about library *services* (e.g. fines info, loan period etc) you should edit `website/data/library_services_information.csv`.

After your Pull Request is merged, a GitHub Action will automatically create a second pull request that merges data from `website/data/library_services_information.csv` into `website/data/boundaries.topo.json`. Please do not edit the `topo.json` file directly.

To update information about library *locations* (e.g. street address, phone number, coordinates) you shoudl edit the relevant csv location file:

* `website/data/indigenous_knowledge_centre_locations.csv`
* `website/data/mechanics_institute_locations.csv`
* `website/data/nsla_library_locations.csv`
* `website/data/public_library_locations.csv`

### Citing and crediting data sources

If you are adding a lot of data and have a new source for it, make sure it is cited. You should update the list of sources at both `sources.md` *and* `website/sources/index.html`. If your source is "I just know because it's my local library" or "I looked it up on their website" you don't need to add that to the list of sources. If your source is "I found a PDF listing every public library on the State Library website", you do.

### Missing or inaccurate data

Currently we're missing data for some library services in relation to **standard loan periods** and **fines for overdue items**.

It's likely that some **library location data** is inaccurate &mdash; especially for New South Wales. It's also possible that the address data is wrong (even though the location shown may be correct), and in some cases it is missing.

It's possible that some of the **fines data for Queensland** is a little off. This came from the State Library of Queensland but I know for a fact that some of the data was wrong (e.g. Gold Coast Libraries does not charge overdue fines, but the SLQ reports says it does).

I am particularly interested if you know of data sources for entire regions, states, or Australia &mdash; especially if they're reliably kept up to date.

If you can fill in any of these blanks, please update the relevant CSV file and send a pull request. If your data is coming from somewhere in particular, you should also add that to `sources.md` in the relevant table.

### Ideas for additional data

You might have an idea for library data that would be useful to map. I'm really happy to hear about these ideas! It's possible that the information you want to map is unavailable, or just really hard to get, or maybe I will disagree that it's useful. That's ok - please ask anyway, expecially if you know where to find the data.

### Improvements to documentation

I'm always &mdash; *always* &mdash; happy to hear how I can improve documentation. Even better if you make the edit and then send a pull request.

### Improvements to the website design, layout, or information

You might have an idea for an improvement that's not about the data per se, but rather about the website. Maybe there's some accessibilty improvements I can make. Let me know!

### Licensing and copyright

By contributing to this project you agree to license your work under the following licenses:

**/website/data/\***: [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/)

**everything else**: [GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.txt)
