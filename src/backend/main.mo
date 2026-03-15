import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Recipe = {
    id : Nat;
    name : Text;
    ingredients : [Text];
    steps : [Text];
    estimatedTimeMinutes : Nat;
    difficulty : Text;
    isVeg : Bool;
    cuisine : Text;
    description : Text;
  };

  type RecipeMatch = {
    recipe : Recipe;
    matchScore : Nat;
  };

  type UserProfile = {
    displayName : Text;
    favoriteCount : Nat;
    searchesPerformed : Nat;
  };

  module RecipeMatch {
    public func compare(a : RecipeMatch, b : RecipeMatch) : Order.Order {
      Nat.compare(b.matchScore, a.matchScore);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let recipes = Map.empty<Nat, Recipe>();
  let favorites = Map.empty<Principal, [Nat]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextRecipeId = 1;

  // Helper: check if an ingredient string contains an available keyword
  func ingredientMatches(ingredient : Text, available : Text) : Bool {
    let ingLower = ingredient.toLower();
    let avLower = available.toLower();
    ingLower.contains(#text avLower) or avLower.contains(#text ingLower);
  };

  let seedRecipes : [Recipe] = [
    // ── ITALIAN ──────────────────────────────────────────────────────────────
    { id = 0; name = "Classic Spaghetti Aglio e Olio"; description = "Simple Italian pasta with garlic, olive oil, and chilli flakes."; ingredients = ["200g spaghetti", "6 cloves garlic", "4 tbsp olive oil", "1 tsp chilli flakes", "30g parmesan"]; steps = ["Boil pasta in salted water until al dente.", "Thinly slice garlic and sauté in olive oil until golden.", "Toss drained pasta with garlic oil and chilli flakes.", "Top with parmesan and serve immediately."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Italian"; isVeg = true; },
    { id = 0; name = "Margherita Pizza"; description = "Classic Neapolitan pizza with tomato sauce and fresh mozzarella."; ingredients = ["300g pizza dough", "3 ripe tomatoes", "150g mozzarella", "6 fresh basil leaves", "2 tbsp olive oil", "2 cloves garlic", "1 tsp salt"]; steps = ["Stretch dough into a round base.", "Spread tomato sauce evenly.", "Add torn mozzarella.", "Bake at 250C for 8–10 minutes.", "Top with fresh basil and olive oil."]; estimatedTimeMinutes = 30; difficulty = "Medium"; cuisine = "Italian"; isVeg = true; },
    { id = 0; name = "Mushroom Risotto"; description = "Creamy Italian rice slowly cooked with mushrooms and parmesan."; ingredients = ["300g arborio rice", "250g mushroom", "1 onion", "3 cloves garlic", "60g parmesan", "40g butter", "100ml white wine", "1 litre vegetable stock"]; steps = ["Sauté onion and garlic in butter.", "Toast rice 2 minutes.", "Deglaze with white wine.", "Add warm stock ladle by ladle, stirring constantly.", "Fold in mushrooms, parmesan and butter."]; estimatedTimeMinutes = 40; difficulty = "Hard"; cuisine = "Italian"; isVeg = true; },
    { id = 0; name = "Beef Bolognese"; description = "Slow-cooked Italian meat sauce for pasta."; ingredients = ["500g minced beef", "1 onion", "1 carrot", "2 stalks celery", "4 cloves garlic", "2 tbsp tomato paste", "400g tomato", "150ml red wine", "100ml milk", "400g pasta", "50g parmesan"]; steps = ["Sauté onion, carrot and celery.", "Brown beef in batches.", "Add garlic, tomato paste and wine.", "Stir in tomatoes and milk, simmer 1 hour.", "Serve with pasta and parmesan."]; estimatedTimeMinutes = 90; difficulty = "Medium"; cuisine = "Italian"; isVeg = false; },
    { id = 0; name = "Pesto Pasta"; description = "Quick basil pesto pasta with pine nuts and parmesan."; ingredients = ["400g pasta", "40g fresh basil", "30g pine nuts", "50g parmesan", "2 cloves garlic", "5 tbsp olive oil", "1 lemon"]; steps = ["Blend basil, pine nuts, parmesan, garlic and olive oil.", "Cook pasta in salted water.", "Reserve some pasta water.", "Toss pasta with pesto, adding water to loosen.", "Serve with extra parmesan."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Italian"; isVeg = true; },
    { id = 0; name = "Caprese Salad"; description = "Simple Italian salad of tomato, mozzarella and basil."; ingredients = ["3 large tomatoes", "200g mozzarella", "10 fresh basil leaves", "3 tbsp olive oil", "1 tbsp balsamic vinegar", "salt and pepper"]; steps = ["Slice tomatoes and mozzarella evenly.", "Alternate slices on a plate.", "Tuck basil leaves between slices.", "Drizzle with olive oil and balsamic.", "Season and serve."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Italian"; isVeg = true; },
    { id = 0; name = "Minestrone Soup"; description = "Classic Italian vegetable soup with pasta and beans."; ingredients = ["1 onion", "2 carrots", "2 stalks celery", "400g tomato", "1 courgette", "400g cannellini beans", "100g pasta", "3 cloves garlic", "1 litre vegetable stock", "fresh basil", "50g parmesan", "2 tbsp olive oil"]; steps = ["Sauté onion, carrot and celery in olive oil.", "Add garlic, tomato and courgette.", "Pour in stock and simmer 15 minutes.", "Add pasta and beans, cook until pasta is tender.", "Serve with basil and parmesan."]; estimatedTimeMinutes = 40; difficulty = "Easy"; cuisine = "Italian"; isVeg = true; },
    // ── INDIAN (NORTH) ────────────────────────────────────────────────────────
    { id = 0; name = "Butter Chicken"; description = "Tender chicken in a rich, spiced tomato-cream sauce."; ingredients = ["500g chicken", "3 tomatoes", "50g butter", "100ml cream", "5 cloves garlic", "1 tbsp ginger paste", "1 tsp garam masala", "1 tsp turmeric", "2 onions", "2 tbsp oil"]; steps = ["Marinate chicken in spices and yoghurt.", "Grill or pan-fry chicken until charred.", "Cook onion, garlic and ginger, then add tomatoes.", "Blend sauce, add cream and butter.", "Simmer chicken in sauce 10 minutes."]; estimatedTimeMinutes = 45; difficulty = "Medium"; cuisine = "Indian"; isVeg = false; },
    { id = 0; name = "Palak Paneer"; description = "Creamy spinach curry with soft paneer cubes."; ingredients = ["300g spinach", "200g paneer", "1 onion", "4 cloves garlic", "1 tsp ginger paste", "1 tsp cumin", "2 tomatoes", "3 tbsp cream", "2 tbsp oil"]; steps = ["Blanch spinach and blend to a smooth puree.", "Fry onion, garlic, ginger and cumin.", "Add tomatoes and cook until soft.", "Stir in spinach puree and paneer.", "Finish with cream and season."]; estimatedTimeMinutes = 35; difficulty = "Medium"; cuisine = "Indian"; isVeg = true; },
    { id = 0; name = "Dal Tadka"; description = "Comforting yellow lentil curry tempered with cumin and garlic."; ingredients = ["200g lentils", "1 onion", "4 cloves garlic", "2 tomatoes", "1 tsp cumin seeds", "1/2 tsp turmeric", "2 dried red chillies", "1 tbsp ghee", "handful coriander"]; steps = ["Cook lentils with turmeric until soft.", "Fry onion, garlic and tomatoes.", "Add to lentils and simmer 10 minutes.", "Temper with ghee, cumin and dried chilli.", "Garnish with coriander and serve with rice."]; estimatedTimeMinutes = 40; difficulty = "Easy"; cuisine = "Indian"; isVeg = true; },
    { id = 0; name = "Chickpea Curry (Chana Masala)"; description = "Bold, tangy chickpea curry with amchur and garam masala."; ingredients = ["400g chickpeas", "2 onions", "3 tomatoes", "4 cloves garlic", "1 tbsp ginger paste", "1 tsp cumin", "1 tsp coriander powder", "1 tsp garam masala", "1/2 tsp turmeric", "2 green chillies", "2 tbsp oil", "handful coriander", "1 lemon"]; steps = ["Fry blended onion-tomato base in oil until deep red.", "Add all dry spices and cook 2 minutes.", "Add chickpeas and water.", "Simmer 20 minutes.", "Add lemon juice and garnish with fresh coriander."]; estimatedTimeMinutes = 35; difficulty = "Easy"; cuisine = "Indian"; isVeg = true; },
    { id = 0; name = "Chicken Tikka Masala"; description = "Marinated grilled chicken in a creamy tomato-spiced sauce."; ingredients = ["500g chicken breast", "150g yoghurt", "3 tomatoes", "100ml cream", "4 cloves garlic", "1 tbsp ginger paste", "2 onions", "2 tsp garam masala", "1 tsp cumin", "1 tsp coriander powder", "1/2 tsp turmeric", "2 tbsp butter"]; steps = ["Marinate chicken in yoghurt and spices for 1 hour.", "Grill or bake until charred.", "Sauté onion, garlic and ginger.", "Add spices, tomatoes and simmer 15 minutes.", "Blend sauce, add cream and chicken.", "Simmer 10 more minutes."]; estimatedTimeMinutes = 60; difficulty = "Medium"; cuisine = "Indian"; isVeg = false; },
    { id = 0; name = "Paneer Tikka"; description = "Smoky marinated paneer cubes grilled with peppers and onions."; ingredients = ["300g paneer", "100g yoghurt", "4 cloves garlic", "1 tsp ginger paste", "1 tsp cumin", "1 tsp chilli powder", "1/2 tsp turmeric", "1 bell pepper", "1 onion", "juice of 1 lemon"]; steps = ["Cube paneer and marinate in yoghurt and spices for 30 minutes.", "Thread onto skewers with pepper and onion.", "Grill or bake at 220C for 12 minutes.", "Char briefly under a hot grill.", "Serve with mint chutney."]; estimatedTimeMinutes = 50; difficulty = "Medium"; cuisine = "Indian"; isVeg = true; },
    { id = 0; name = "Vegetable Korma"; description = "Creamy, mild Indian curry with mixed vegetables and cashew paste."; ingredients = ["1 potato", "1 carrot", "100g peas", "200g cauliflower", "1 onion", "3 cloves garlic", "1 tsp ginger paste", "30g cashews", "3 tbsp cream", "100g yoghurt", "1 tsp garam masala", "1 tsp cumin", "1 tsp coriander powder", "2 tbsp oil"]; steps = ["Blend cashews with water into a paste.", "Fry onion, garlic and ginger until soft.", "Add spices and vegetables.", "Stir in yoghurt, cream and cashew paste.", "Simmer 20 minutes until tender.", "Serve with naan."]; estimatedTimeMinutes = 40; difficulty = "Medium"; cuisine = "Indian"; isVeg = true; },
    { id = 0; name = "Aloo Gobi"; description = "Dry Indian curry with potatoes and cauliflower."; ingredients = ["2 potatoes", "1/2 cauliflower", "1 onion", "3 cloves garlic", "1 tsp ginger paste", "1 tsp cumin seeds", "1/2 tsp turmeric", "1 tsp coriander powder", "2 green chillies", "2 tbsp oil", "handful coriander"]; steps = ["Fry onion with cumin seeds until golden.", "Add garlic, ginger and dry spices.", "Add potato and cauliflower, toss to coat.", "Cook covered on low heat for 20 minutes.", "Garnish with fresh coriander."]; estimatedTimeMinutes = 35; difficulty = "Easy"; cuisine = "Indian"; isVeg = true; },
    // ── SOUTH INDIAN ──────────────────────────────────────────────────────────
    { id = 0; name = "Idli with Sambar"; description = "Soft steamed rice-lentil cakes served with tangy lentil sambar and coconut chutney."; ingredients = ["2 cups idli rice", "1 cup urad dal", "1/2 tsp fenugreek seeds", "salt to taste", "100g toor dal", "1 drumstick", "1 tomato", "1 onion", "1 tsp tamarind paste", "1 tsp sambar powder", "1/2 tsp mustard seeds", "1/2 tsp cumin", "10 curry leaves", "2 tbsp oil"]; steps = ["Soak idli rice and urad dal separately for 6 hours.", "Grind separately, mix and ferment batter overnight.", "Add salt, pour into idli moulds and steam 10–12 minutes.", "Cook toor dal with tomato, onion and drumstick.", "Temper with mustard seeds, cumin and curry leaves.", "Add tamarind paste and sambar powder, simmer 10 minutes.", "Serve idlis with hot sambar and coconut chutney."]; estimatedTimeMinutes = 30; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Plain Dosa"; description = "Crispy, golden fermented rice-lentil crepe served with coconut chutney and sambar."; ingredients = ["2 cups dosa rice", "1/2 cup urad dal", "1/4 tsp fenugreek seeds", "salt to taste", "oil for cooking", "50g fresh coconut", "2 green chillies", "1 tbsp roasted chana dal", "1/2 tsp mustard seeds", "5 curry leaves"]; steps = ["Soak rice and dal for 6 hours, grind to smooth batter, ferment overnight.", "Spread batter thin on a hot tawa in a circular motion.", "Drizzle oil on edges and cook until crisp and golden.", "Blend coconut, chillies, roasted chana dal and salt for chutney.", "Temper chutney with mustard seeds and curry leaves.", "Serve dosa with coconut chutney and sambar."]; estimatedTimeMinutes = 20; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Masala Dosa"; description = "Crispy dosa filled with spiced potato masala."; ingredients = ["2 cups dosa batter", "3 boiled potatoes", "1 onion", "1/2 tsp mustard seeds", "1/2 tsp turmeric", "10 curry leaves", "2 green chillies", "1 tbsp oil", "handful coriander", "oil for cooking"]; steps = ["Heat oil, add mustard seeds, curry leaves and green chillies.", "Add sliced onion and fry until soft.", "Mash potatoes with turmeric, mix into the onion.", "Season and add coriander.", "Spread thin dosa on tawa, place potato filling on one side.", "Fold and serve with coconut chutney and sambar."]; estimatedTimeMinutes = 25; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Ven Pongal"; description = "Comforting South Indian rice and moong dal porridge tempered with pepper and ghee."; ingredients = ["1 cup raw rice", "1/2 cup moong dal", "1 tsp black pepper", "1 tsp cumin seeds", "10 cashews", "10 curry leaves", "1 tbsp ginger (grated)", "2 tbsp ghee", "salt to taste"]; steps = ["Dry-roast moong dal until lightly golden.", "Pressure cook rice and dal together with 4 cups water until very soft.", "Heat ghee, fry cashews, add cumin, pepper and curry leaves.", "Add grated ginger and fry 1 minute.", "Mix tempering into rice-dal, adjust salt.", "Serve hot with coconut chutney."]; estimatedTimeMinutes = 25; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Medu Vada"; description = "Crispy South Indian doughnut-shaped fritters made from urad dal, served with sambar."; ingredients = ["1 cup urad dal", "1 tbsp black pepper", "1 tsp cumin seeds", "10 curry leaves", "2 green chillies", "salt to taste", "oil for deep frying"]; steps = ["Soak urad dal 2 hours, grind to fluffy thick batter.", "Add pepper, cumin, curry leaves, chillies and salt.", "Wet hands, shape batter into rings.", "Deep fry in hot oil until golden brown.", "Drain and serve with sambar and coconut chutney."]; estimatedTimeMinutes = 30; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Rasam"; description = "Thin, tangy South Indian pepper-tamarind broth served as a soup or over rice."; ingredients = ["1 lemon-sized tamarind", "2 tomatoes", "1 tsp black pepper", "1 tsp cumin seeds", "1/2 tsp turmeric", "4 cloves garlic", "1/2 tsp mustard seeds", "10 curry leaves", "1 dried red chilli", "1 tbsp ghee", "handful coriander", "salt to taste"]; steps = ["Soak tamarind in water, extract juice.", "Add tomatoes, turmeric and salt, boil 10 minutes.", "Coarsely crush pepper, cumin and garlic.", "Add crushed spices to rasam and simmer 5 minutes.", "Temper mustard seeds, curry leaves and dried chilli in ghee.", "Pour tempering into rasam, garnish with coriander."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Puliyodarai (Tamarind Rice)"; description = "Tangy Tamil Nadu rice dish tossed with a tamarind and spice paste."; ingredients = ["2 cups cooked rice", "1 lemon-sized tamarind", "1 tsp mustard seeds", "1 tsp chana dal", "1 tsp urad dal", "1/2 tsp turmeric", "2 dried red chillies", "10 curry leaves", "1 tbsp peanuts", "2 tbsp sesame oil", "salt to taste", "1 tsp coriander powder"]; steps = ["Extract thick tamarind juice.", "Heat sesame oil, add mustard seeds, dals, peanuts and dried chillies.", "Add curry leaves and tamarind juice.", "Add turmeric, coriander powder and salt.", "Cook thick tamarind paste (pulikachal) 15 minutes.", "Toss with cooked rice and mix well."]; estimatedTimeMinutes = 30; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Sambar"; description = "Classic South Indian lentil and vegetable stew with tamarind and sambar powder."; ingredients = ["1 cup toor dal", "2 drumsticks", "1 tomato", "1 onion", "1/2 tsp tamarind paste", "1.5 tsp sambar powder", "1/2 tsp turmeric", "1 tsp mustard seeds", "10 curry leaves", "2 dried red chillies", "2 tbsp oil", "salt to taste"]; steps = ["Pressure cook toor dal until soft.", "Boil drumstick, tomato and onion in tamarind water.", "Add cooked dal, sambar powder, turmeric and salt.", "Simmer 10–12 minutes.", "Temper mustard seeds, curry leaves and dried chillies in oil.", "Pour tempering into sambar and serve."]; estimatedTimeMinutes = 35; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Chettinad Chicken Curry"; description = "Fiery, aromatic chicken curry from the Chettinad region with freshly ground spices."; ingredients = ["500g chicken", "2 onions", "3 tomatoes", "1 tbsp ginger-garlic paste", "1 tsp black pepper", "2 tsp chettinad masala", "1 tsp turmeric", "1/2 tsp fennel seeds", "10 curry leaves", "3 tbsp oil", "handful coriander", "2 dried red chillies"]; steps = ["Grind pepper, fennel and dried chillies into a coarse powder.", "Fry onions in oil until deep golden.", "Add ginger-garlic paste and cook 2 minutes.", "Add tomatoes and cook until oil separates.", "Add chicken, turmeric and chettinad masala.", "Stir in ground spice powder.", "Simmer covered 25–30 minutes.", "Garnish with curry leaves and coriander."]; estimatedTimeMinutes = 50; difficulty = "Medium"; cuisine = "Tamil Nadu"; isVeg = false; },
    { id = 0; name = "Upma"; description = "Quick South Indian savoury semolina porridge with vegetables and tempering."; ingredients = ["1 cup rava (semolina)", "1 onion", "2 green chillies", "1 tsp mustard seeds", "1 tsp urad dal", "1 tsp chana dal", "10 curry leaves", "2 tsp ginger (grated)", "2 tbsp oil", "handful coriander", "salt to taste", "2 cups water"]; steps = ["Dry roast rava until lightly golden, set aside.", "Heat oil, add mustard seeds, dals and curry leaves.", "Add onion, green chillies and ginger, sauté until soft.", "Pour 2 cups boiling water, add salt.", "Add roasted rava slowly, stirring continuously.", "Cook covered 2 minutes, garnish with coriander."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Aviyal"; description = "Mixed vegetables simmered in coconut and yoghurt sauce — a Kerala classic."; ingredients = ["100g raw banana", "100g yam", "1 carrot", "100g drumstick", "100g raw mango", "1/2 cup grated coconut", "2 green chillies", "1 tsp cumin seeds", "1/2 cup curd", "10 curry leaves", "1 tbsp coconut oil", "1/2 tsp turmeric", "salt to taste"]; steps = ["Cut all vegetables into finger-length pieces.", "Cook with turmeric, salt and a little water until tender.", "Grind coconut, green chillies and cumin into a coarse paste.", "Add coconut paste to vegetables, cook 3 minutes.", "Remove from heat, stir in curd.", "Finish with curry leaves and coconut oil."]; estimatedTimeMinutes = 35; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Meen Kuzhambu (Fish Curry)"; description = "Tangy Tamil Nadu fish curry simmered in tamarind and spiced coconut gravy."; ingredients = ["400g fish pieces (kingfish or snapper)", "1 lemon-sized tamarind", "2 tomatoes", "1 onion", "1 tsp chilli powder", "1/2 tsp turmeric", "1 tsp coriander powder", "1/2 tsp fennel seeds", "10 curry leaves", "2 tbsp sesame oil", "salt to taste"]; steps = ["Extract tamarind juice and set aside.", "Fry shallots and tomatoes in sesame oil.", "Add chilli powder, turmeric, coriander and fennel.", "Pour in tamarind juice and simmer 10 minutes.", "Gently add fish pieces and cook 10–12 minutes.", "Garnish with curry leaves and serve with rice."]; estimatedTimeMinutes = 35; difficulty = "Medium"; cuisine = "Tamil Nadu"; isVeg = false; },
    { id = 0; name = "Curd Rice (Thayir Sadam)"; description = "Comforting Tamil Nadu yoghurt rice tempered with mustard seeds and curry leaves."; ingredients = ["2 cups cooked rice", "1 cup curd", "2 tbsp milk", "1 tsp mustard seeds", "1 tsp urad dal", "2 green chillies", "10 curry leaves", "1 tsp ginger (grated)", "1 tbsp oil", "salt to taste", "pomegranate seeds (garnish)"]; steps = ["Mash cooked rice while warm.", "Mix in curd, milk and salt.", "Heat oil, add mustard seeds and urad dal.", "Add curry leaves, green chillies and ginger.", "Pour tempering over curd rice and mix.", "Garnish with pomegranate seeds and serve."]; estimatedTimeMinutes = 15; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Kootu (Vegetable and Lentil)"; description = "South Indian semi-dry curry of vegetables and lentils with fresh coconut paste."; ingredients = ["200g raw banana or yam", "100g chana dal", "50g grated coconut", "1 tsp cumin seeds", "2 green chillies", "1/2 tsp turmeric", "1 tsp mustard seeds", "5 curry leaves", "1 tbsp coconut oil", "salt to taste"]; steps = ["Cook chana dal and vegetables separately until soft.", "Grind coconut, cumin and green chillies into a paste.", "Combine cooked dal and vegetables.", "Add coconut paste and mix well, simmer 5 minutes.", "Temper mustard seeds and curry leaves in coconut oil.", "Pour over kootu and serve."]; estimatedTimeMinutes = 30; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Vatha Kuzhambu"; description = "Dark, tangy tamarind-based Tamil curry made with sun-dried vegetables and spices."; ingredients = ["1 lemon-sized tamarind", "1 tsp mustard seeds", "1 tsp urad dal", "10 curry leaves", "2 dried red chillies", "1/2 tsp turmeric", "1.5 tsp kuzhambu milagai thool", "100g manathakkali vathal", "2 tbsp sesame oil", "salt to taste"]; steps = ["Extract thick tamarind juice.", "Fry vathal in sesame oil until crisp.", "Add mustard seeds, urad dal, curry leaves and dried chillies.", "Add kuzhambu powder and stir 1 minute.", "Pour tamarind juice, add turmeric and salt.", "Boil until thick and oil floats on top, about 20 minutes."]; estimatedTimeMinutes = 30; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Kothamalli Chutney (Coriander Chutney)"; description = "Fresh green coriander chutney, a staple side dish for South Indian tiffin."; ingredients = ["2 cups fresh coriander", "50g grated coconut", "2 green chillies", "1 tbsp roasted chana dal", "1 clove garlic", "1/2 tsp cumin seeds", "juice of 1/2 lemon", "salt to taste", "1 tsp mustard seeds", "5 curry leaves", "1 tsp oil"]; steps = ["Blend coriander, coconut, green chillies, chana dal, garlic and cumin with a little water.", "Add lemon juice and salt, blend to smooth chutney.", "Temper mustard seeds and curry leaves in oil.", "Pour tempering over chutney and mix."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Tomato Chutney"; description = "Tangy and spicy tomato chutney made with tamarind and red chillies — perfect with dosa."; ingredients = ["3 ripe tomatoes", "4 dried red chillies", "4 cloves garlic", "1/2 tsp tamarind", "salt to taste", "1 tsp mustard seeds", "1 tsp urad dal", "10 curry leaves", "1 tbsp oil"]; steps = ["Roast dried red chillies and garlic in a dry pan.", "Add tomatoes and cook until soft.", "Cool and blend with tamarind and salt into a coarse paste.", "Temper mustard seeds, urad dal and curry leaves in oil.", "Add tomato paste to tempering and cook 3 minutes."]; estimatedTimeMinutes = 15; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Semiya Payasam (Vermicelli Kheer)"; description = "Sweet South Indian vermicelli dessert with milk, sugar and cardamom."; ingredients = ["100g semiya (vermicelli)", "500ml milk", "4 tbsp sugar", "1/4 tsp cardamom powder", "10 cashews", "10 raisins", "1 tbsp ghee", "a few strands saffron"]; steps = ["Roast semiya in ghee until golden.", "Boil milk and add roasted semiya.", "Cook 8–10 minutes, stirring.", "Add sugar, cardamom and saffron.", "Fry cashews and raisins in ghee.", "Add to payasam and serve warm."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Keerai Masiyal (Spinach Mash)"; description = "Simple and healthy Tamil mashed spinach dish cooked with garlic and tempered with mustard seeds."; ingredients = ["300g spinach (keerai)", "4 cloves garlic", "2 dried red chillies", "1/2 tsp cumin seeds", "1/2 tsp mustard seeds", "5 curry leaves", "1 tbsp oil", "salt to taste"]; steps = ["Wash and roughly chop spinach.", "Cook spinach with garlic and a pinch of salt until wilted.", "Mash coarsely with the back of a spoon.", "Temper mustard seeds, cumin, dried chillies and curry leaves in oil.", "Add tempered spices to spinach and mix well."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    { id = 0; name = "Prawn Masala"; description = "Spiced prawn stir-fry with onions, tomatoes and coconut — a coastal Tamil favourite."; ingredients = ["400g prawns (cleaned)", "2 onions", "2 tomatoes", "1 tbsp ginger-garlic paste", "1 tsp chilli powder", "1/2 tsp turmeric", "1 tsp coriander powder", "50g grated coconut", "10 curry leaves", "3 tbsp oil", "handful coriander", "salt to taste"]; steps = ["Marinate prawns with turmeric and salt.", "Fry onions in oil until golden.", "Add ginger-garlic paste and cook 2 minutes.", "Add tomatoes, chilli powder and coriander powder.", "Cook until masala is thick and oil separates.", "Add prawns and cook 5–7 minutes.", "Stir in grated coconut, garnish with curry leaves and coriander."]; estimatedTimeMinutes = 30; difficulty = "Medium"; cuisine = "Tamil Nadu"; isVeg = false; },
    { id = 0; name = "Appam with Vegetable Stew"; description = "Soft lacy rice hoppers served with a mild Kerala-style vegetable stew."; ingredients = ["2 cups raw rice", "1/2 cup grated coconut", "1/2 tsp yeast", "1 tsp sugar", "salt to taste", "1 potato", "1 carrot", "100g green beans", "400ml coconut milk", "1 onion", "2 green chillies", "1 tsp ginger (grated)", "10 curry leaves", "1 tsp oil"]; steps = ["Soak rice overnight, grind with coconut to smooth batter.", "Add yeast and sugar, ferment 4 hours.", "Pour batter in appam pan, swirl to spread, cover and cook.", "For stew: cook vegetables with water until tender.", "Add coconut milk, green chillies, ginger and curry leaves.", "Simmer 5 minutes, season and serve with appam."]; estimatedTimeMinutes = 30; difficulty = "Medium"; cuisine = "South Indian"; isVeg = true; },
    { id = 0; name = "Lemon Rice (Elumichai Sadam)"; description = "Tangy Tamil Nadu rice dish tossed with lemon juice, turmeric and tempered peanuts."; ingredients = ["2 cups cooked rice", "juice of 2 lemons", "1/2 tsp turmeric", "1 tsp mustard seeds", "1 tsp chana dal", "1 tsp urad dal", "2 dried red chillies", "2 tbsp peanuts", "10 curry leaves", "2 tbsp oil", "salt to taste"]; steps = ["Heat oil, add mustard seeds, dals, peanuts and dried chillies.", "Add curry leaves and turmeric.", "Add cooked rice and mix gently.", "Pour lemon juice over rice and toss.", "Season with salt and serve warm."]; estimatedTimeMinutes = 15; difficulty = "Easy"; cuisine = "Tamil Nadu"; isVeg = true; },
    // ── ASIAN ─────────────────────────────────────────────────────────────────
    { id = 0; name = "Vegetable Fried Rice"; description = "Classic wok-tossed fried rice with colourful vegetables."; ingredients = ["2 cups cooked rice", "2 eggs", "1 carrot", "100g peas", "3 tbsp soy sauce", "3 cloves garlic", "1 tsp ginger paste", "2 tbsp oil", "2 stalks spring onion"]; steps = ["Scramble eggs and set aside.", "Stir fry garlic, ginger, carrots and peas.", "Add rice and soy sauce, toss on high heat.", "Mix in eggs and spring onions."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "Asian"; isVeg = false; },
    { id = 0; name = "Pad Thai"; description = "Thailand's famous stir-fried noodles with egg, peanuts and lime."; ingredients = ["200g rice noodles", "2 eggs", "3 stalks spring onion", "100g bean sprouts", "30g peanuts", "1 lime", "2 tbsp fish sauce", "2 tbsp tamarind paste", "1 tsp sugar", "2 tbsp oil"]; steps = ["Soak noodles until pliable.", "Fry egg in hot wok, scramble lightly.", "Add noodles, tamarind, fish sauce and sugar.", "Toss in bean sprouts and spring onion.", "Serve with crushed peanuts and lime."]; estimatedTimeMinutes = 25; difficulty = "Medium"; cuisine = "Thai"; isVeg = false; },
    { id = 0; name = "Tom Yum Soup"; description = "Hot and sour Thai soup with lemongrass and mushrooms."; ingredients = ["300g prawns", "200g mushrooms", "2 stalks lemongrass", "juice of 2 limes", "3 tbsp fish sauce", "4 bird's eye chillies", "4 slices galangal", "4 kaffir lime leaves", "handful coriander"]; steps = ["Simmer lemongrass, galangal and lime leaves in stock.", "Add mushrooms and cook 5 minutes.", "Drop in prawns.", "Season with fish sauce, lime juice and chilli.", "Garnish with coriander."]; estimatedTimeMinutes = 20; difficulty = "Medium"; cuisine = "Thai"; isVeg = false; },
    { id = 0; name = "Korean Bibimbap"; description = "Colourful Korean rice bowl with mixed vegetables and a fried egg."; ingredients = ["2 cups cooked rice", "2 eggs", "1 carrot", "100g spinach", "100g mushrooms", "100g bean sprouts", "3 tbsp soy sauce", "1 tbsp sesame oil", "2 tbsp gochujang", "3 cloves garlic"]; steps = ["Cook rice and prepare each vegetable separately.", "Season each veg with garlic and sesame oil.", "Fry egg sunny-side up.", "Arrange veg and egg over rice.", "Serve with gochujang sauce."]; estimatedTimeMinutes = 40; difficulty = "Medium"; cuisine = "Korean"; isVeg = false; },
    { id = 0; name = "Kung Pao Chicken"; description = "Spicy Sichuan stir-fry with chicken, peanuts, chilli and garlic."; ingredients = ["400g chicken breast", "50g peanuts", "8 dried chillies", "4 cloves garlic", "1 tsp ginger paste", "3 tbsp soy sauce", "2 tbsp rice vinegar", "1 tsp sugar", "1 tsp cornstarch", "3 stalks spring onion", "2 tbsp oil"]; steps = ["Marinate chicken in soy and cornstarch.", "Fry dried chillies in oil.", "Add chicken and stir fry until cooked.", "Toss in peanuts, sauce and spring onion.", "Serve with steamed rice."]; estimatedTimeMinutes = 25; difficulty = "Medium"; cuisine = "Chinese"; isVeg = false; },
    { id = 0; name = "Teriyaki Salmon"; description = "Glazed salmon fillet in a sweet and savoury teriyaki sauce."; ingredients = ["2 salmon fillets (300g)", "3 tbsp soy sauce", "2 tbsp mirin", "2 tbsp sake", "1 tbsp sugar", "2 cloves garlic", "1 tsp ginger paste", "1 tsp sesame seeds", "2 stalks spring onion"]; steps = ["Mix soy, mirin, sake and sugar for sauce.", "Marinate salmon 30 minutes.", "Pan-fry salmon skin-down 4 minutes.", "Flip and brush with more teriyaki glaze.", "Serve over rice with sesame and spring onion."]; estimatedTimeMinutes = 40; difficulty = "Easy"; cuisine = "Japanese"; isVeg = false; },
    { id = 0; name = "Ramen Noodle Soup"; description = "Rich Japanese pork broth with ramen noodles, soft-boiled egg and chashu pork."; ingredients = ["200g ramen noodles", "300g pork belly", "2 eggs", "4 tbsp soy sauce", "2 tbsp mirin", "4 cloves garlic", "1 tbsp ginger paste", "3 stalks spring onion", "1 tbsp sesame oil", "2 sheets nori"]; steps = ["Simmer bones 3 hours for broth.", "Braise pork belly in soy, mirin and garlic.", "Soft-boil eggs and marinate in soy sauce.", "Cook ramen noodles.", "Assemble bowl with broth, noodles and toppings."]; estimatedTimeMinutes = 60; difficulty = "Hard"; cuisine = "Japanese"; isVeg = false; },
    { id = 0; name = "Miso Soup"; description = "Traditional Japanese soup with miso, tofu and wakame."; ingredients = ["3 tbsp miso paste", "150g silken tofu", "5g dried wakame", "2 stalks spring onion", "750ml dashi stock"]; steps = ["Heat dashi stock until just simmering.", "Dissolve miso paste in a ladle of stock.", "Return to pot and do not boil.", "Add tofu and rehydrated wakame.", "Garnish with spring onion."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Japanese"; isVeg = true; },
    { id = 0; name = "Chicken Katsu Curry"; description = "Japanese curry with crispy panko-breaded chicken cutlet."; ingredients = ["2 chicken breasts (400g)", "50g panko breadcrumbs", "1 egg", "50g flour", "2 tsp curry powder", "1 onion", "1 carrot", "1 potato", "2 tbsp soy sauce", "400ml vegetable stock", "2 tbsp oil", "2 cups rice"]; steps = ["Flatten chicken breast.", "Coat in flour, egg and panko.", "Deep fry until golden and cooked through.", "Fry onion, carrot and potato for curry.", "Add curry powder and stock, simmer 20 minutes.", "Blend sauce, slice katsu and serve over rice."]; estimatedTimeMinutes = 50; difficulty = "Medium"; cuisine = "Japanese"; isVeg = false; },
    { id = 0; name = "Nasi Goreng"; description = "Indonesian spiced fried rice with sweet kecap manis and a fried egg."; ingredients = ["2 cups cooked rice", "2 eggs", "3 tbsp kecap manis", "4 cloves garlic", "3 shallots", "2 bird's eye chillies", "150g prawns", "2 stalks spring onion", "1/2 cucumber", "2 tbsp oil"]; steps = ["Fry shallots, garlic and chilli in oil.", "Add cold rice and kecap manis, toss on high heat.", "Push rice aside, scramble in eggs.", "Mix together and add prawns.", "Serve with spring onion and cucumber."]; estimatedTimeMinutes = 20; difficulty = "Medium"; cuisine = "Indonesian"; isVeg = false; },
    // ── MEXICAN ───────────────────────────────────────────────────────────────
    { id = 0; name = "Beef Tacos"; description = "Spicy minced beef in corn tortillas with fresh salsa."; ingredients = ["400g minced beef", "6 corn tortillas", "1 onion", "3 cloves garlic", "2 tomatoes", "1 tsp chilli powder", "1 tsp cumin", "1 lime", "handful coriander", "50g cheese"]; steps = ["Brown minced beef with onion and garlic.", "Season with chilli powder and cumin.", "Warm tortillas in a dry pan.", "Assemble tacos with beef and fresh salsa.", "Finish with lime and coriander."]; estimatedTimeMinutes = 30; difficulty = "Easy"; cuisine = "Mexican"; isVeg = false; },
    { id = 0; name = "Guacamole"; description = "Creamy avocado dip with lime, coriander and jalapeno."; ingredients = ["3 ripe avocados", "juice of 2 limes", "handful fresh coriander", "1/2 red onion", "1 jalapeno", "1 tomato", "1 tsp salt"]; steps = ["Mash ripe avocados in a bowl.", "Finely dice onion, tomato and jalapeno.", "Mix in lime juice, coriander and seasoning.", "Taste and adjust lime and salt."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Mexican"; isVeg = true; },
    // ── MEDITERRANEAN ─────────────────────────────────────────────────────────
    { id = 0; name = "Shakshuka"; description = "Eggs poached in spiced tomato and pepper sauce."; ingredients = ["4 eggs", "400g crushed tomatoes", "1 bell pepper", "1 onion", "3 cloves garlic", "1 tsp cumin", "1 tsp paprika", "2 green chillies", "3 tbsp olive oil", "handful parsley"]; steps = ["Sauté onion, garlic and peppers in olive oil.", "Add spices and cook 1 minute.", "Pour in crushed tomatoes and simmer 10 minutes.", "Create wells and crack in eggs.", "Cover and cook until whites are set.", "Garnish with parsley."]; estimatedTimeMinutes = 25; difficulty = "Easy"; cuisine = "Mediterranean"; isVeg = true; },
    { id = 0; name = "Tomato Basil Soup"; description = "Rich, velvety tomato soup with fresh basil and cream."; ingredients = ["6 ripe tomatoes", "1 onion", "4 cloves garlic", "10 fresh basil leaves", "100ml cream", "30g butter"]; steps = ["Roast tomatoes and onions until caramelised.", "Blend with garlic and stock.", "Simmer with cream and season well.", "Garnish with fresh basil."]; estimatedTimeMinutes = 35; difficulty = "Easy"; cuisine = "Mediterranean"; isVeg = true; },
    { id = 0; name = "Greek Salad"; description = "Fresh summer salad with tomatoes, cucumber, olives and feta."; ingredients = ["3 tomatoes", "1 cucumber", "1/2 red onion", "100g olives", "150g feta", "3 tbsp olive oil", "1 tsp dried oregano", "juice of 1 lemon"]; steps = ["Chop tomatoes, cucumber and red onion.", "Combine in a bowl with olives.", "Crumble feta on top.", "Drizzle with olive oil and lemon juice.", "Season with oregano, salt and pepper."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Mediterranean"; isVeg = true; },
    { id = 0; name = "Falafel Wraps"; description = "Crispy chickpea falafel in flatbread with tahini sauce."; ingredients = ["400g chickpeas", "1/2 onion", "3 cloves garlic", "handful parsley", "1 tsp cumin", "1 tsp coriander powder", "2 tbsp flour", "2 flatbreads", "3 tbsp tahini", "1 lemon", "1/2 cucumber", "1 tomato"]; steps = ["Blend chickpeas, herbs, spices and flour.", "Form into balls and deep-fry until golden.", "Whisk tahini with lemon and water.", "Warm flatbreads.", "Fill with falafel, salad and tahini sauce."]; estimatedTimeMinutes = 35; difficulty = "Medium"; cuisine = "Middle Eastern"; isVeg = true; },
    { id = 0; name = "Hummus"; description = "Smooth, creamy Middle Eastern chickpea and tahini dip."; ingredients = ["400g chickpeas", "3 tbsp tahini", "juice of 2 lemons", "2 cloves garlic", "3 tbsp olive oil", "1 tsp cumin", "salt to taste", "1 tsp paprika"]; steps = ["Blend chickpeas until smooth.", "Add tahini, lemon juice and garlic.", "Stream in olive oil while blending.", "Season with cumin and salt.", "Serve topped with paprika and olive oil."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Middle Eastern"; isVeg = true; },
    { id = 0; name = "Lemon Garlic Prawns"; description = "Juicy prawns sautéed in butter, garlic and lemon."; ingredients = ["400g prawns", "5 cloves garlic", "40g butter", "juice of 2 lemons", "handful parsley", "1 tsp chilli flakes", "salt to taste"]; steps = ["Heat butter in a pan.", "Sauté garlic and chilli flakes.", "Add prawns and cook 2 minutes each side.", "Deglaze with lemon juice.", "Scatter parsley and serve immediately."]; estimatedTimeMinutes = 15; difficulty = "Easy"; cuisine = "Mediterranean"; isVeg = false; },
    // ── AMERICAN / EUROPEAN ───────────────────────────────────────────────────
    { id = 0; name = "Chicken Caesar Salad"; description = "Crispy romaine with grilled chicken, croutons and Caesar dressing."; ingredients = ["2 chicken breasts", "1 head romaine lettuce", "50g parmesan", "1 cup croutons", "3 cloves garlic", "juice of 1 lemon", "4 tbsp olive oil", "2 anchovies", "1 egg yolk"]; steps = ["Grill chicken breast and slice.", "Whisk garlic, anchovy, egg yolk, lemon and oil for dressing.", "Toss lettuce with dressing.", "Top with chicken, parmesan and croutons."]; estimatedTimeMinutes = 25; difficulty = "Medium"; cuisine = "American"; isVeg = false; },
    { id = 0; name = "Beef Burger"; description = "Juicy homemade beef patty with all the classic toppings."; ingredients = ["400g minced beef", "2 burger buns", "2 lettuce leaves", "2 tomatoes", "1 onion", "2 slices cheese", "2 tbsp ketchup", "1 tsp mustard", "4 pickle slices"]; steps = ["Season beef and form into patties.", "Grill or pan-fry 4 minutes per side.", "Melt cheese on top in final minute.", "Toast buns cut-side down.", "Assemble with all toppings."]; estimatedTimeMinutes = 20; difficulty = "Easy"; cuisine = "American"; isVeg = false; },
    { id = 0; name = "Beef Stew"; description = "Slow-simmered beef with root vegetables in a rich gravy."; ingredients = ["600g beef", "2 potatoes", "2 carrots", "1 onion", "2 stalks celery", "3 cloves garlic", "2 tbsp tomato paste", "750ml beef stock", "1 sprig thyme", "2 bay leaves", "2 tbsp flour", "2 tbsp oil"]; steps = ["Brown beef chunks in batches.", "Sauté onion, carrot and celery.", "Stir in flour and tomato paste.", "Add stock, herbs and return beef.", "Slow cook for 2 hours until tender."]; estimatedTimeMinutes = 150; difficulty = "Medium"; cuisine = "European"; isVeg = false; },
    { id = 0; name = "Avocado Toast"; description = "Creamy smashed avocado on toasted sourdough."; ingredients = ["2 slices sourdough bread", "1 avocado", "juice of 1/2 lemon", "1/2 tsp chilli flakes", "salt to taste", "2 eggs", "1 tbsp olive oil"]; steps = ["Toast sourdough slices.", "Smash avocado with lemon, salt and chilli.", "Spread over toast.", "Poach or fry egg and place on top.", "Drizzle with olive oil."]; estimatedTimeMinutes = 10; difficulty = "Easy"; cuisine = "Australian"; isVeg = true; },
    { id = 0; name = "Fish and Chips"; description = "Classic British battered cod with golden crispy chips."; ingredients = ["2 cod fillets (300g)", "4 large potatoes", "100g flour", "150ml beer", "1 tsp baking powder", "salt to taste", "oil for frying", "1 lemon", "tartar sauce"]; steps = ["Cut potatoes into thick chips and par-boil.", "Make batter with flour, beer and baking powder.", "Fry chips until golden and drain.", "Dip fish in batter and deep-fry until crisp.", "Serve with lemon and tartar sauce."]; estimatedTimeMinutes = 45; difficulty = "Medium"; cuisine = "British"; isVeg = false; },
    { id = 0; name = "French Onion Soup"; description = "Deeply caramelised onion soup topped with melted Gruyere on croutons."; ingredients = ["6 large onions", "1 litre beef stock", "50g butter", "1 tbsp flour", "150ml white wine", "4 slices baguette", "100g gruyere", "3 sprigs thyme", "2 bay leaves"]; steps = ["Slowly caramelise onions in butter for 45 minutes.", "Deglaze with white wine.", "Add flour, stock and herbs, simmer 20 minutes.", "Ladle into bowls, top with bread and cheese.", "Grill until cheese is golden and bubbling."]; estimatedTimeMinutes = 75; difficulty = "Medium"; cuisine = "French"; isVeg = false; },
    { id = 0; name = "Vegetable Soup"; description = "Hearty mixed vegetable soup with herbs."; ingredients = ["2 carrots", "2 potatoes", "2 stalks celery", "1 onion", "3 cloves garlic", "2 tomatoes", "1 litre vegetable stock", "1 tsp dried thyme", "2 bay leaves", "handful parsley"]; steps = ["Dice all vegetables evenly.", "Sauté onion, garlic and celery.", "Add remaining veg and stock.", "Simmer 25 minutes until tender.", "Season and garnish with parsley."]; estimatedTimeMinutes = 40; difficulty = "Easy"; cuisine = "European"; isVeg = true; },
    { id = 0; name = "Cauliflower Cheese"; description = "Tender cauliflower baked in a rich, golden cheese sauce."; ingredients = ["1 head cauliflower", "150g cheddar", "400ml milk", "40g butter", "40g flour", "1 tsp mustard", "salt and pepper"]; steps = ["Steam cauliflower florets until just tender.", "Make a roux with butter and flour.", "Gradually add milk, stirring to a smooth sauce.", "Melt in cheddar and season with mustard.", "Pour over cauliflower and grill until golden."]; estimatedTimeMinutes = 35; difficulty = "Easy"; cuisine = "British"; isVeg = true; },
    { id = 0; name = "Banana Pancakes"; description = "Fluffy two-ingredient pancakes made with banana and egg."; ingredients = ["2 ripe bananas", "2 eggs", "1 tbsp butter", "1/2 tsp cinnamon", "2 tbsp maple syrup"]; steps = ["Mash banana and whisk with eggs.", "Add pinch of cinnamon.", "Cook small rounds in buttered pan.", "Flip after 2 minutes when bubbles form.", "Serve with maple syrup."]; estimatedTimeMinutes = 15; difficulty = "Easy"; cuisine = "American"; isVeg = true; },
  ];

  for (recipe in seedRecipes.values()) {
    let newRecipe = { recipe with id = nextRecipeId };
    recipes.add(nextRecipeId, newRecipe);
    nextRecipeId += 1;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addRecipe(recipe : Recipe) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add recipes");
    };
    let newRecipe = { recipe with id = nextRecipeId };
    recipes.add(nextRecipeId, newRecipe);
    nextRecipeId += 1;
  };

  public query func getAllRecipes() : async [Recipe] {
    recipes.values().toArray();
  };

  public query func searchRecipes(availableIngredients : [Text], isVeg : ?Bool, maxTimeMinutes : ?Nat, difficulty : ?Text) : async [RecipeMatch] {
    var filteredRecipes = recipes.values().toArray();

    if (isVeg != null) {
      let vegFilter = switch (isVeg) { case (?v) { v }; case (null) { false }; };
      filteredRecipes := filteredRecipes.filter(func(r) { r.isVeg == vegFilter });
    };

    if (maxTimeMinutes != null) {
      let maxTime = switch (maxTimeMinutes) { case (?t) { t }; case (null) { 0 }; };
      filteredRecipes := filteredRecipes.filter(func(r) { r.estimatedTimeMinutes <= maxTime });
    };

    if (difficulty != null) {
      let diffFilter = switch (difficulty) { case (?d) { d }; case (null) { "" }; };
      filteredRecipes := filteredRecipes.filter(func(r) { r.difficulty == diffFilter });
    };

    let matches = filteredRecipes.map(
      func(recipe : Recipe) : RecipeMatch {
        var matchCount = 0;
        for (ingredient in recipe.ingredients.values()) {
          for (available in availableIngredients.values()) {
            if (ingredientMatches(ingredient, available)) {
              matchCount += 1;
            };
          };
        };
        let matchScore = if (recipe.ingredients.size() > 0) {
          (matchCount * 100) / recipe.ingredients.size();
        } else { 0; };
        { recipe; matchScore };
      }
    );

    let sorted = matches.sort(func(a : RecipeMatch, b : RecipeMatch) : Order.Order {
      if (a.matchScore > b.matchScore) #less
      else if (a.matchScore < b.matchScore) #greater
      else #equal
    });
    sorted;
  };

  public shared ({ caller }) func addFavorite(recipeId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };
    switch (recipes.get(recipeId)) {
      case (null) { Runtime.trap("Recipe not found") };
      case (?_) {};
    };
    let callerFavorites = switch (favorites.get(caller)) { case (null) { [] }; case (?existing) { existing }; };
    for (favId in callerFavorites.values()) {
      if (favId == recipeId) { return; };
    };
    let updatedFavorites = callerFavorites.concat([recipeId]);
    favorites.add(caller, updatedFavorites);
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { { displayName = ""; favoriteCount = 0; searchesPerformed = 0; }; };
      case (?existing) { existing };
    };
    userProfiles.add(caller, { currentProfile with favoriteCount = updatedFavorites.size(); });
  };

  public shared ({ caller }) func removeFavorite(recipeId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };
    let callerFavorites = switch (favorites.get(caller)) { case (null) { return }; case (?existing) { existing }; };
    let updatedFavorites = callerFavorites.filter(func(favId : Nat) : Bool { favId != recipeId });
    favorites.add(caller, updatedFavorites);
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { { displayName = ""; favoriteCount = 0; searchesPerformed = 0; }; };
      case (?existing) { existing };
    };
    userProfiles.add(caller, { currentProfile with favoriteCount = updatedFavorites.size(); });
  };

  public query ({ caller }) func getFavorites() : async [Recipe] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    let callerFavorites = switch (favorites.get(caller)) { case (null) { [] }; case (?existing) { existing }; };
    callerFavorites.filterMap(func(recipeId) { recipes.get(recipeId) });
  };

  public shared ({ caller }) func updateProfile(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { { displayName = ""; favoriteCount = 0; searchesPerformed = 0; }; };
      case (?existing) { existing };
    };
    userProfiles.add(caller, { displayName; favoriteCount = currentProfile.favoriteCount; searchesPerformed = currentProfile.searchesPerformed; });
  };

  public query ({ caller }) func getProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { { displayName = ""; favoriteCount = 0; searchesPerformed = 0; }; };
      case (?profile) { profile };
    };
  };
};
