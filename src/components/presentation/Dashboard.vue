<template>
    <v-container>
    <div>My Presentations</div>
    <div v-if="presentations" class="flex">
        <div class="w-[300px] mx-3" v-for="presentation in presentations" :key="presentation">
            <v-card
                elevation="1"
                max-width="300"
                class=""
            >
            <div class="flex justify-between">
                <div class="h6 align-center">{{ presentation.topic }}</div>
                <v-btn @click="downloadPresentation(presentation)" color="red" variant="text" icon="mdi-file-powerpoint"></v-btn>
            </div>
                <v-carousel
                    cycle
                    height="350"
                    hide-delimiters
                    show-arrows="hover"
                >   
                    <v-carousel-item
                        v-for="(slide, i) in presentation.slides"
                        :key="i"
                        >
                        <div class="">
                            {{ slide.Title }}
                        </div>
                        <v-img :src="profileImagePath(slide.Image)"></v-img>
                    </v-carousel-item>
                </v-carousel>               
            </v-card>

        </div>
    </div>
    
    <v-card
            class="mx-auto"
            max-width="344"
            title="New Presentation"
        >
            <v-container>
            <v-text-field
                v-model="topic"
                color="primary"
                label="Topic"
                variant="underlined"
            ></v-text-field>
            <!-- <div v-if="authErrors.name" class="text-red-500 text-sm">{{ authErrors.name[0] }}</div> -->
            <v-text-field
                v-model="num_of_slides"
                type="number"
                color="primary"
                label="Number of slides"
                variant="underlined"
            ></v-text-field>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                @click="submit" 
                color="success"
                :loading="loading"
            >
                Generate

                <v-icon icon="mdi-chevron-right" end></v-icon>
            </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import axios from "axios"
import { useMainStore } from '../../store/main'
import { BASE_IMAGE_URL } from '../../constant'
import pptxgen from 'pptxgenjs';


const topic = ref('')
const num_of_slides = ref(0)
const loading = ref(false)

const main = useMainStore()

onMounted(async () => {
    await main.getPresentations()
})

const presentations = computed(() => {
    return main.presentations
})

const profileImagePath = (url) => {
    return BASE_IMAGE_URL + '/' + url;
}

const submit = async () => {
    loading.value = true
   
    const promptText = `This is a presentation about ${topic.value}. You MUST answer in the topic's LANGUAGE and MUST have ${num_of_slides.value} slides. Each slide has a short title and a description of 1 sentence to 3 sentences in this format:
                Title:
                Description:`;
    const apiURL = 'http://localhost:5000/openai'

    try {
        const response = await axios.post(apiURL, {
                prompt: promptText,
                max_tokens: 700,
                temperature: 0.7,
                model: "text-davinci-003"
            }, {
            // Add any additional headers if needed
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Process the response as needed
        const generatedText = response.data.choices[0].text;       
        const converted = await convertResponseToJSON(generatedText)
        console.log('converted', converted)
       
    } catch (error) {
        // Handle errors, e.g., display an error message in your Vue component
        console.error('Error making OpenAI request:', error);
        loading.value = false
    }

}

const convertResponseToJSON = async (responseText) => {
    const slides = responseText.split('\n\n');
    const jsonSlides = [];

    for (const slide of slides) {
        const lines = slide.split('\n');
        if (lines.length >= 2) {
            const titleLine = lines[1]; // Line containing title
            const descriptionLine = lines[2]; // Line containing description

            // Extract the title and description by trimming any extra characters
            const title = titleLine.replace('Title: ', '').trim();
            const description = descriptionLine.replace('Description: ', '').trim();

            // Generate an image based on the description
            const imageUrl = await generateImage(description);
            const convertedImage = await convertImageToFile(imageUrl)
            console.log('convertedImage ', convertedImage)
            const slideObject = {
                Title: title,
                Description: description,
                Image: convertedImage,
            };

            jsonSlides.push(slideObject);
        }
    }
    const saveData = await save(jsonSlides)
    console.log('saveData', saveData)
    return jsonSlides

}


const generateImage = async (topic) => {
    const apiURL = 'http://localhost:5000/generate-image'

    const promptText = `Generate an image based on the subject for this topic: ${topic}.`

    try {
        const response = await axios.post(apiURL, {
                prompt: promptText,
                n: 1,
                size: "512x512",
            }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Process the response as needed
        const generatedImage = response.data.data[0].url
        return generatedImage     
        
    } catch (error) {
        // Handle errors, e.g., display an error message in your Vue component
        console.error('Error making OpenAI request:', error);
        // should return image error
    }
}

const convertImageToFile = async (url) => {
    try {    
        const data = { url }
        // Create a FormData object to send the image file to the backend
        const res = await axios.post('/api/save-image', data)
        return res.data.path
      } catch (error) {
        console.error('Error:', error);
        ///return error
      }
}

const save = async (jsonData) => {
    const presentationData = {
        topic: topic.value,
        background: '',
        color: '',
        num_of_slides: num_of_slides.value,
        slides: JSON.stringify(jsonData),
    }
    await axios.post('/api/presentation', presentationData)
        .then(response => {
          // Handle success, e.g., show a success message or redirect
            const alert = {
                color: 'success',
                message: 'Presentation successfully created!'
            }
            main.setAlert(alert)
            loading.value = false
          console.log('Presentation created:', response);
        })
        .catch(error => {
          // Handle errors, e.g., display an error message
          console.error('Error creating presentation:', error);
        });
}

const downloadPresentation = async (data) => {
    console.log(data)
    const pptx = new pptxgen();

    // Create a slide
    for (const element of data.slides) {
        const slide = pptx.addSlide();

        // Add title and content to the slide
        const imagePath = BASE_IMAGE_URL + '/' + element.Image // Update with your image path
        const imageBase64 = await fetchImageAsBase64(imagePath);

        slide.addText(element.Title, {
            x: .5,
            y: 0,
            w: '90%',
            h: 1,
            fontSize: 36,
            bold: true,
            color: '363636',
            align: 'center',
        });
        slide.addText(element.Description, {
            x: 4.2,
            y: 1.3,
            w: '50%',
            h: 1,
            fontSize: 18,
            color: '363636',
        });
        slide.addImage({ data:imageBase64, x: 1, y: 1.2, w: 3.0, h: 3.0 });
    };
    

    // Generate and download the presentation
    pptx.writeFile();
}

const fetchImageAsBase64 = async (url) => {
    const apiURL = 'http://localhost:5000/image-convert?url=' + encodeURIComponent(url)
    try {
        const response = await axios.get(apiURL);
        return response.data
        
    } catch (error) {
        // Handle errors, e.g., display an error message in your Vue component
        return error
    }
}

</script>