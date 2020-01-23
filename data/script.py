from bs4 import BeautifulSoup as bs
import requests as req, re

header = "https://www.imdb.com/title/"
ALL = "movies.tsv"	# Dataset with data for all the movies.
FINAL = "movies.tsv"# Dataset with data for the movies finally used.
YEAR = 2000	# Value to limit the total number of movies in the final file by its year.

# Fetching the general data for the movies:
data = open("/title.basics.tsv/data.tsv", "r", encoding="utf-8").readlines()[1:]

# Fetching the ratings (and votes) for the movies:
ratings = {}
for movie in open("/title.ratings.tsv/data.tsv", "r").readlines()[:-1]:
	field = movie.split("\t")
	ratings[field[0]] = { (field[1], field[2][:-1]) }


out = open(ALL, "w")

for movie in data:
	field = movie.split("\t")
	# Only use elements labeled and movies and with registerd votes.
	if (field[1]  == "movie") and (field[0] in ratings) and (field[5] != '\\N' and int(field[5]) >= YEAR):
		# Removing unused fields:
		field.pop(1)
		field.pop(2)
		field.pop(2)
		field.pop(3)
		# Adding the rating data to the data used:
		extra = tuple(ratings[field[0]])[0]
		field.insert(-1, extra[0])
		field.insert(-1, extra[1])

		for e in field:
			out.write(e)
			if field[-1] != e: out.write("\t")	# Tabular separation.

out.close()



print("Purging least voted films")
# Movies with a rating below average are not used.

data = open(ALL, "r").readlines()
purged = []	# Final movies used.
mean_votes = 0

for  movie in data:
	field = movie.split("\t")
	mean_votes += int(field[-2])

mean_votes /= len(data)
print("Mean of number of votes " + str(mean_votes))

for movie in data:
	field = movie.split("\t")
	if int(field[5]) > mean_votes: purged.append(movie)

out = open(FINAL, "w")

print("Remaining films = " + str(len(purged)))


print("Fetching budget and grossings")

# For the final movies, its IMDb's page is downloaded and the money data is added.
out.write("ID\ttitle\tyear\truntime\trating\tvotes\tbudget\topening_weekend_usa\tgross_usa\tworldwide_gross\tgenres\n")
for used in purged:
	field = used.split("\t")	

	webpage = req.get(header + field[0])		# Page for each movie.
	html = bs(webpage.content, "html.parser")	# html tree for the page.

	# Find and extract the desired DOM fields:
	pageData = html.find(id="wrapper").find(id="root").find(id="pagecontent").find(id="content-2-wide").find(id="main_bottom").find(id="titleDetails")#.find_all("div", "txt-block")
	moneyParents = [page.find_parent("div", "txt-block") for page in pageData.find_all(string=re.compile("[$]"))]
	moneyDesc = [re.search(">(.*):<", str(child)).group(1) for moneyParent in moneyParents for child in moneyParent.find_all("h4", "inline")]
	moneyData = [int(child.replace('$', '').replace(',', '')) for moneyParent in moneyParents for child in moneyParent.find_all(string=re.compile("[$]"))]

	#print(moneyDesc) # ['Budget', 'Opening Weekend USA', 'Gross USA', 'Cumulative Worldwide Gross']
	#print(moneyData) # [48000000, 9725408, 47121859, 76019048]
	if "Budget" in moneyDesc:
		field.insert(-1, str(moneyData[moneyDesc.index("Budget")]))
	else: field.insert(-1, "n/a")
	if "Opening Weekend USA" in moneyDesc:
		field.insert(-1, str(moneyData[moneyDesc.index("Opening Weekend USA")]))
	else: field.insert(-1, "n/a")
	if "Gross USA" in moneyDesc:
		field.insert(-1, str(moneyData[moneyDesc.index("Gross USA")]))
	else: field.insert(-1, "n/a")
	if "Cumulative Worldwide Gross" in moneyDesc:
		field.insert(-1, str(moneyData[moneyDesc.index("Cumulative Worldwide Gross")]))
	else: field.insert(-1, "n/a")

	#print(field)

	# Print the final file:
	for e in field:
			out.write(e)
			if field[-1] != e: out.write("\t")

print("Done!")
