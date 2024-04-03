import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import dbConnection from './db/connect'
import FavYoutubeModel from './db/youtube-model'
import { isValidObjectId } from 'mongoose'
import { stream, streamText, streamSSE } from "hono/streaming"

const app = new Hono()

//middlewares
app.use(poweredBy())
app.use(logger())


dbConnection()
  .then(() => {
    // Get List
    app.get('/', async (c) => {
      const documents = await FavYoutubeModel.find();
      return c.json(
        documents.map((d) => d.toObject())
      )
    })

    // Create Documet
    app.post('/', async (c) => {
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl
      const dataObject = new FavYoutubeModel(formData)
      try {
        const document = await dataObject.save()
        return c.json(document.toObject())
      } catch (err) {
        return c.json(
          (err as any)?.message || "Internal Server Error"
          , 500
        )
      }
    })

    // View Document
    app.get('/:documentId', async (c) => {
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid Id")
      const document = await FavYoutubeModel.findById(id)
      if (!document) return c.json("Document  not found")
      return c.json(document.toObject())
    })

    // View Entire Document
    app.get('/d/:documentId', async (c) => {
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid Id")
      const document = await FavYoutubeModel.findById(id)
      if (!document) return c.json("Document  not found")
      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log('Client disconnected!')
        })
        for (let index = 0; index < document.description.length; index++) {
          await stream.write(document.description[index])
          // wait 1 second
          await stream.sleep(1000)
        }
      })
    })

    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid Id")
      const document = await FavYoutubeModel.findById(id)
      if (!document) return c.json("Document  not found")

      const formData = await c.req.json()
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl
      try {
        const updatedDocuments = await FavYoutubeModel.findByIdAndUpdate(
          id,
          formData,
          {
            new: true
          }
        )

        return c.json({
          data: updatedDocuments?.toObject()
        })
      } catch (err) {
        return c.json(
          (err as any)?.message || "Internal Server Error"
          , 500
        )
      }

    })

    app.delete('/:documentId', async (c) => {
      const id = c.req.param("documentId")
      try {
        const document = await FavYoutubeModel.findByIdAndDelete({ id })
        if (document) {
          return c.json("Deleted Successfully")
        } else {
          return c.json("No such Document Found!")
        }
      } catch (err) {
        return c.json(
          (err as any)?.message || "Internal Server Error"
          , 500
        )
      }
    })


  })
  .catch((e) => {
    app.get('/*', (c) => {
      return c.text(`Failed to connect mongodb: ${e.message}`)
    })
  })

app.onError((err, c) => {
  return c.text(`App Error: ${err.message}`)
})


export default app
