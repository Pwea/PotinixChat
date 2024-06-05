import random

letters = list("abcdefghijklmnopqrstuvwxyz")
lettersCap = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

pass_length = 15

result = ""

for i in range(pass_length):
    numOrletter = random.randint(1, 2)
    if numOrletter == 1:
        isCap = random.randint(1, 2)
        if isCap == 1:
            result += random.choice(letters)
        else:
            result += random.choice(lettersCap)
    else:
        result += str(random.randint(0, 9))
        
print(result)