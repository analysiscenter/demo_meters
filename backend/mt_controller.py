import os
import sys
import re
import numpy as np
import base64

from imageio import imread
from imageio import imsave
from skimage.transform import resize

sys.path.append('./meters')
from meters.batch import MeterBatch
from meters.dataset import FilesIndex, Dataset, Pipeline, V, B
from meters.dataset.dataset.models.tf import TFModel

sys.path.append("./default_meters/")
sys.path.append("./uploaded_meters/")

class MtController:
    def __init__(self):
        self.meters_path = os.path.join(os.getcwd(), "default_meters")
        self.uploaded_files_path = os.path.join(os.getcwd(), "uploaded_meters")
        self.meters_filenames = sorted(os.listdir(self.meters_path))

        bbox_model_path = os.path.join(os.getcwd(), 'models', 'resnet_for_the_poor_last_epoch_iou69/')
        digits_model_path = os.path.join(os.getcwd(), 'models', 'VGG7/')

        self.output_shape = (500, 500)

        self.predict_pipeline = (Pipeline()
                                    .init_model('static', TFModel, 'model',
                                                 config={'load' : {'path' : bbox_model_path}, 'build': False})
                                    .init_model('static', TFModel, 'VGG7',
                                                 config={'load' : {'path' : digits_model_path}, 'build': False})
                                    .load(fmt='image', components='images')
                                    .resize((120, 120),  order=1, preserve_range=False,
                                            src='images', dst='resized_images')
                                    .init_variable('bbox_predictions', init_on_each_run=0)
                                    .predict_model('model', fetches=['predictions'],
                                                   feed_dict={'images': B('resized_images')},
                                                   save_to=[ B('pred_coordinates')])
                                    .get_global_coordinates(src='pred_coordinates', img='images')
                                    .update_variable('bbox_predictions', B('pred_coordinates'), mode='w')
                                    .crop_from_bbox(src='images', component_coord="pred_coordinates")
                                    .split_to_digits(n_digits=8)
                                    .init_variable('labels', init_on_each_run=0)
                                    .resize((64, 32),  order=1, preserve_range=False)
                                    .predict_model('VGG7', fetches='output_labels',
                                                   feed_dict={'images': B('images')},
                                                   save_to=V('labels'))
                                    )
    def build_ds(self, path):
        print('BUILDING DATASET')
        return Dataset(index=FilesIndex(path=path), batch_class=MeterBatch)

    def get_list(self, data, meta):
        print("DEFAULT LIST CONTAINS " + str(len(self.meters_filenames)) + ' ITEMS')
        return dict(data=[dict(id='default/' + fname) for fname in self.meters_filenames],
                    meta=meta)

    def _read_image(self, image_name):
        print(os.path.join(self.meters_path, image_name))
        return imread(os.path.join(self.meters_path, image_name))

    def get_item_data(self, data, meta):
        print('GET_ITEM_DATA CALLED')
        image_type, image_name = data['id'].split('/')
        if image_type != "default":
            print("Error: wrong image type. Expected \"default\", got {0}".format(image_type))
            return dict(data=data, meta=meta)
        image = self._read_image(image_name)
        path = os.path.join(self.meters_path, image_name)
        print('-' * 10 + 'reading' + path)
        with open(path, 'rb') as f:
            img = base64.b64encode(bytearray(f.read()))
        print('-' * 10 + 'success')
        data['src'] = img
        return dict(data=data, meta=meta)

    def upload_image(self, data, meta):
        print("UPLOAD IMAGE CALLED")
        image_data = data['src']
        image_type, image_name = data['id'].split('/')
        if image_type != "uploaded":
            print("Error: wrong image type. Expected \"uploaded\", got {0}".format(image_type))
            return dict(data=data, meta=meta)
        path = os.path.join(self.uploaded_files_path, image_name)
        print('-' * 10 + 'writing' + path)
        with open(path, 'wb') as f:
            f.write(base64.b64decode(image_data.split('base64,')[1]))
        print('-' * 10 + 'success')    
        data = {'id': data['id']}      
        return self.get_inference(data, meta)

    def get_inference(self, data, meta):
        print('GET_INFERENCE CALLED')
        item_type, item_name = data['id'].split('/')
        if item_type == "default":
            path = os.path.join(self.meters_path, item_name)
        elif item_type == "uploaded":
            path = os.path.join(self.uploaded_files_path, item_name)
        else:
            print("Unknown item type", item_type)
            return dict(data=data, meta=meta)
        image = imread(path)
        self.output_shape = image.shape[:2]
        dset = self.build_ds(path)
        print('dataset has been built', dset.indices)
        pred = self.predict_pipeline << dset
        print('created pred')
        pred.next_batch(1)
        print('got next batch')
        print('image.shape', image.shape[1::-1])
        bbox = pred.get_variable('bbox_predictions')[0] * np.tile(self.output_shape, 2) / np.tile(image.shape[1::-1], 2)
        labels = pred.get_variable('labels')
        inference = {"bbox": bbox.tolist(), "value": ''.join(map(str, labels))}
        data["inference"] = inference
        print('inference data', data)
        return dict(data=data, meta=meta)
